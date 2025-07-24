-- =====================================================
-- COMANDOS PARA BACKUP DOS DADOS - AGENDA PRO
-- Data: $(date)
-- Projeto Supabase ID: suoddfvhzjsklbpdptje
-- =====================================================

-- IMPORTANTE: Execute estes comandos no terminal do PostgreSQL ou no Supabase SQL Editor
-- Os arquivos CSV serão gerados no diretório especificado

-- =====================================================
-- EXPORTAÇÃO DOS DADOS (COPY TO CSV)
-- =====================================================

-- 1. Tabela: perfis
COPY (SELECT * FROM public.perfis ORDER BY criado_em) TO '/tmp/perfis.csv' WITH CSV HEADER;

-- 2. Tabela: clientes
COPY (SELECT * FROM public.clientes ORDER BY criado_em) TO '/tmp/clientes.csv' WITH CSV HEADER;

-- 3. Tabela: agenda_eventos
COPY (SELECT * FROM public.agenda_eventos ORDER BY criado_em) TO '/tmp/agenda_eventos.csv' WITH CSV HEADER;

-- 4. Tabela: configuracoes_empresa
COPY (SELECT * FROM public.configuracoes_empresa ORDER BY criado_em) TO '/tmp/configuracoes_empresa.csv' WITH CSV HEADER;

-- 5. Tabela: configuracoes_integracoes
COPY (SELECT * FROM public.configuracoes_integracoes ORDER BY created_at) TO '/tmp/configuracoes_integracoes.csv' WITH CSV HEADER;

-- 6. Tabela: contratos
COPY (SELECT * FROM public.contratos ORDER BY criado_em) TO '/tmp/contratos.csv' WITH CSV HEADER;

-- 7. Tabela: financeiro_pagamentos
COPY (SELECT * FROM public.financeiro_pagamentos ORDER BY criado_em) TO '/tmp/financeiro_pagamentos.csv' WITH CSV HEADER;

-- 8. Tabela: financeiro_transacoes
COPY (SELECT * FROM public.financeiro_transacoes ORDER BY criado_em) TO '/tmp/financeiro_transacoes.csv' WITH CSV HEADER;

-- 9. Tabela: indicacoes
COPY (SELECT * FROM public.indicacoes ORDER BY criado_em) TO '/tmp/indicacoes.csv' WITH CSV HEADER;

-- 10. Tabela: media_imagens
COPY (SELECT * FROM public.media_imagens ORDER BY criado_em) TO '/tmp/media_imagens.csv' WITH CSV HEADER;

-- 11. Tabela: mensagens
COPY (SELECT * FROM public.mensagens ORDER BY criado_em) TO '/tmp/mensagens.csv' WITH CSV HEADER;

-- 12. Tabela: mensagens_configuracoes
COPY (SELECT * FROM public.mensagens_configuracoes ORDER BY criado_em) TO '/tmp/mensagens_configuracoes.csv' WITH CSV HEADER;

-- 13. Tabela: mensagens_modelos
COPY (SELECT * FROM public.mensagens_modelos ORDER BY criado_em) TO '/tmp/mensagens_modelos.csv' WITH CSV HEADER;

-- 14. Tabela: mensagens_gatilhos
COPY (SELECT * FROM public.mensagens_gatilhos ORDER BY criado_em) TO '/tmp/mensagens_gatilhos.csv' WITH CSV HEADER;

-- 15. Tabela: mensagens_logs
COPY (SELECT * FROM public.mensagens_logs ORDER BY criado_em) TO '/tmp/mensagens_logs.csv' WITH CSV HEADER;

-- 16. Tabela: mensagens_templates
COPY (SELECT * FROM public.mensagens_templates ORDER BY criado_em) TO '/tmp/mensagens_templates.csv' WITH CSV HEADER;

-- 17. Tabela: notificacoes
COPY (SELECT * FROM public.notificacoes ORDER BY criado_em) TO '/tmp/notificacoes.csv' WITH CSV HEADER;

-- 18. Tabela: orcamentos
COPY (SELECT * FROM public.orcamentos ORDER BY criado_em) TO '/tmp/orcamentos.csv' WITH CSV HEADER;

-- 19. Tabela: portfolio
COPY (SELECT * FROM public.portfolio ORDER BY criado_em) TO '/tmp/portfolio.csv' WITH CSV HEADER;

-- 20. Tabela: portfolio_trabalhos
COPY (SELECT * FROM public.portfolio_trabalhos ORDER BY criado_em) TO '/tmp/portfolio_trabalhos.csv' WITH CSV HEADER;

-- 21. Tabela: sistema_atividades
COPY (SELECT * FROM public.sistema_atividades ORDER BY timestamp) TO '/tmp/sistema_atividades.csv' WITH CSV HEADER;

-- 22. Tabela: clientes_completo_obsoleto (OBSOLETA)
COPY (SELECT * FROM public.clientes_completo_obsoleto ORDER BY created_at) TO '/tmp/clientes_completo_obsoleto.csv' WITH CSV HEADER;

-- =====================================================
-- COMANDOS ALTERNATIVOS PARA WINDOWS (PowerShell)
-- =====================================================

-- Se estiver no Windows, use estes caminhos:
-- COPY (SELECT * FROM public.perfis ORDER BY criado_em) TO 'C:\temp\perfis.csv' WITH CSV HEADER;
-- COPY (SELECT * FROM public.clientes ORDER BY criado_em) TO 'C:\temp\clientes.csv' WITH CSV HEADER;
-- ... (repita para todas as tabelas)

-- =====================================================
-- VERIFICAÇÃO DOS DADOS EXPORTADOS
-- =====================================================

-- Contar registros por tabela para verificação
SELECT 'perfis' as tabela, COUNT(*) as total_registros FROM public.perfis
UNION ALL
SELECT 'clientes', COUNT(*) FROM public.clientes
UNION ALL
SELECT 'agenda_eventos', COUNT(*) FROM public.agenda_eventos
UNION ALL
SELECT 'configuracoes_empresa', COUNT(*) FROM public.configuracoes_empresa
UNION ALL
SELECT 'configuracoes_integracoes', COUNT(*) FROM public.configuracoes_integracoes
UNION ALL
SELECT 'contratos', COUNT(*) FROM public.contratos
UNION ALL
SELECT 'financeiro_pagamentos', COUNT(*) FROM public.financeiro_pagamentos
UNION ALL
SELECT 'financeiro_transacoes', COUNT(*) FROM public.financeiro_transacoes
UNION ALL
SELECT 'indicacoes', COUNT(*) FROM public.indicacoes
UNION ALL
SELECT 'media_imagens', COUNT(*) FROM public.media_imagens
UNION ALL
SELECT 'mensagens', COUNT(*) FROM public.mensagens
UNION ALL
SELECT 'mensagens_configuracoes', COUNT(*) FROM public.mensagens_configuracoes
UNION ALL
SELECT 'mensagens_modelos', COUNT(*) FROM public.mensagens_modelos
UNION ALL
SELECT 'mensagens_gatilhos', COUNT(*) FROM public.mensagens_gatilhos
UNION ALL
SELECT 'mensagens_logs', COUNT(*) FROM public.mensagens_logs
UNION ALL
SELECT 'mensagens_templates', COUNT(*) FROM public.mensagens_templates
UNION ALL
SELECT 'notificacoes', COUNT(*) FROM public.notificacoes
UNION ALL
SELECT 'orcamentos', COUNT(*) FROM public.orcamentos
UNION ALL
SELECT 'portfolio', COUNT(*) FROM public.portfolio
UNION ALL
SELECT 'portfolio_trabalhos', COUNT(*) FROM public.portfolio_trabalhos
UNION ALL
SELECT 'sistema_atividades', COUNT(*) FROM public.sistema_atividades
UNION ALL
SELECT 'clientes_completo_obsoleto', COUNT(*) FROM public.clientes_completo_obsoleto
ORDER BY tabela;

-- =====================================================
-- FIM DOS COMANDOS DE BACKUP
-- ===================================================== 