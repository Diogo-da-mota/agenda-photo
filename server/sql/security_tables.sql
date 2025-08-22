-- Criar tabela para configurações de segurança do usuário
CREATE TABLE IF NOT EXISTS user_security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    totp_secret TEXT,
    totp_enabled BOOLEAN DEFAULT FALSE,
    totp_verified BOOLEAN DEFAULT FALSE,
    totp_created_at TIMESTAMPTZ,
    totp_verified_at TIMESTAMPTZ,
    recovery_codes TEXT[] DEFAULT NULL,
    last_password_change TIMESTAMPTZ,
    security_questions JSONB,
    password_attempts INTEGER DEFAULT 0,
    password_locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Adicionar índice para consultas de status 2FA
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_settings_totp_enabled ON user_security_settings(totp_enabled);

-- Criar tabela para registro de atividades de login
CREATE TABLE IF NOT EXISTS user_login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    login_type TEXT NOT NULL, -- 'password', '2fa', 'oauth', 'recovery'
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    location JSONB,
    success BOOLEAN DEFAULT FALSE,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índices para consultas de logs
CREATE INDEX IF NOT EXISTS idx_user_login_logs_user_id ON user_login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_created_at ON user_login_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_success ON user_login_logs(success);

-- Criar tabela para registro de sessões ativas
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    refresh_token TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    location JSONB,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índices para consultas de sessões
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(revoked, expires_at);

-- Criar tabela para registro de alterações de dados sensíveis
CREATE TABLE IF NOT EXISTS user_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'password_change', '2fa_enabled', '2fa_disabled', 'email_change', etc.
    ip_address TEXT,
    user_agent TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índices para consultas de eventos de segurança
CREATE INDEX IF NOT EXISTS idx_user_security_events_user_id ON user_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_events_type ON user_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_security_events_created_at ON user_security_events(created_at);

-- Criar tabela para alertas de segurança
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'suspicious_login', 'brute_force', 'new_device', etc.
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    metadata JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índices para consultas de alertas
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);

-- Adicionar RLS para proteger as tabelas
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários só podem ver/modificar seus próprios dados
CREATE POLICY user_security_settings_policy ON user_security_settings
    USING (auth.uid() = user_id);

CREATE POLICY user_login_logs_policy ON user_login_logs
    USING (auth.uid() = user_id);

CREATE POLICY user_sessions_policy ON user_sessions
    USING (auth.uid() = user_id);

CREATE POLICY user_security_events_policy ON user_security_events
    USING (auth.uid() = user_id);

CREATE POLICY security_alerts_policy ON security_alerts
    USING (auth.uid() = user_id);

-- Criar função para registrar eventos de segurança
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO user_security_events (
        user_id, event_type, ip_address, user_agent, old_value, new_value
    ) VALUES (
        p_user_id, p_event_type, p_ip_address, p_user_agent, p_old_value, p_new_value
    )
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para registrar alertas de segurança
CREATE OR REPLACE FUNCTION create_security_alert(
    p_user_id UUID,
    p_alert_type TEXT,
    p_severity TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    INSERT INTO security_alerts (
        user_id, alert_type, severity, message, metadata
    ) VALUES (
        p_user_id, p_alert_type, p_severity, p_message, p_metadata
    )
    RETURNING id INTO v_alert_id;
    
    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para gerenciar sessões
CREATE OR REPLACE FUNCTION manage_user_session(
    p_user_id UUID,
    p_session_token TEXT,
    p_refresh_token TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_expires_at TIMESTAMPTZ,
    p_device_info JSONB DEFAULT NULL,
    p_location JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Inserir nova sessão
    INSERT INTO user_sessions (
        user_id, session_token, refresh_token, ip_address, user_agent, 
        device_info, location, expires_at
    ) VALUES (
        p_user_id, p_session_token, p_refresh_token, p_ip_address, p_user_agent, 
        p_device_info, p_location, p_expires_at
    )
    RETURNING id INTO v_session_id;
    
    -- Verificar se o dispositivo é novo
    IF NOT EXISTS (
        SELECT 1 FROM user_sessions 
        WHERE user_id = p_user_id 
        AND user_agent = p_user_agent 
        AND ip_address = p_ip_address
        AND id != v_session_id
    ) THEN
        -- Criar alerta para novo dispositivo
        PERFORM create_security_alert(
            p_user_id,
            'new_device',
            'low',
            'Login de um novo dispositivo foi detectado',
            jsonb_build_object(
                'ip_address', p_ip_address,
                'user_agent', p_user_agent,
                'session_id', v_session_id
            )
        );
    END IF;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para detectar atividades suspeitas de login
CREATE OR REPLACE FUNCTION detect_suspicious_login(
    p_user_id UUID,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_success BOOLEAN
) RETURNS VOID AS $$
DECLARE
    v_failed_attempts INTEGER;
    v_unusual_location BOOLEAN := FALSE;
    v_metadata JSONB;
BEGIN
    -- Verificar tentativas de login falhas recentes
    IF NOT p_success THEN
        SELECT COUNT(*) INTO v_failed_attempts
        FROM user_login_logs
        WHERE user_id = p_user_id
        AND success = FALSE
        AND created_at > NOW() - INTERVAL '30 minutes';
        
        -- Se há muitas tentativas falhas, criar alerta
        IF v_failed_attempts >= 5 THEN
            v_metadata := jsonb_build_object(
                'ip_address', p_ip_address,
                'user_agent', p_user_agent,
                'failed_attempts', v_failed_attempts
            );
            
            PERFORM create_security_alert(
                p_user_id,
                'brute_force',
                'high',
                'Múltiplas tentativas de login falhas detectadas',
                v_metadata
            );
            
            -- Atualizar tabela de configurações de segurança
            UPDATE user_security_settings
            SET password_attempts = v_failed_attempts,
                password_locked_until = CASE WHEN v_failed_attempts >= 10 THEN NOW() + INTERVAL '30 minutes' ELSE NULL END
            WHERE user_id = p_user_id;
        END IF;
    ELSE
        -- Login bem-sucedido, verificar se é de um local incomum
        -- Lógica simplificada - em produção, usaria geolocalização por IP
        IF NOT EXISTS (
            SELECT 1 
            FROM user_login_logs
            WHERE user_id = p_user_id
            AND success = TRUE
            AND ip_address = p_ip_address
            AND created_at > NOW() - INTERVAL '30 days'
        ) THEN
            v_unusual_location := TRUE;
            
            v_metadata := jsonb_build_object(
                'ip_address', p_ip_address,
                'user_agent', p_user_agent
            );
            
            PERFORM create_security_alert(
                p_user_id,
                'unusual_location',
                'medium',
                'Login de um local incomum detectado',
                v_metadata
            );
        END IF;
        
        -- Resetar contadores após login bem-sucedido
        UPDATE user_security_settings
        SET password_attempts = 0,
            password_locked_until = NULL
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 