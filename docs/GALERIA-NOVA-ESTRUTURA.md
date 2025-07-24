# 🖼️ NOVA ESTRUTURA DE GALERIA - SOLUÇÃO OTIMIZADA

## 📋 RESUMO EXECUTIVO

**Problema Resolvido:** Sistema criava múltiplos cards ao invés de um card com múltiplas imagens  
**Solução:** Tabela única `galeria` com array JSONB para imagens  
**Benefícios:** Performance, simplicidade, escalabilidade  

## 🏗️ ESTRUTURA DA TABELA `GALERIA`

### Campos Principais
```sql
-- Identificação
id UUID PRIMARY KEY                    -- ID único da galeria
titulo TEXT NOT NULL                   -- Título da galeria
descricao TEXT                         -- Descrição opcional
slug TEXT UNIQUE NOT NULL              -- URL amigável (gerada automaticamente)

-- Relacionamentos
user_id UUID NOT NULL                  -- Proprietário da galeria
cliente_id UUID                        -- Cliente relacionado (opcional)
evento_id UUID                         -- Evento relacionado (opcional)

-- Datas
data_evento DATE                       -- Data do evento
data_entrega DATE                      -- Data de entrega
data_expiracao TIMESTAMPTZ             -- Data de expiração

-- Acesso
senha_acesso TEXT                      -- Senha de acesso (opcional)
link_galeria TEXT                      -- Link personalizado
status TEXT DEFAULT 'ativa'            -- ativa, expirada, arquivada, inativa

-- Estatísticas
total_fotos INTEGER DEFAULT 0          -- Contador automático
total_acessos INTEGER DEFAULT 0        -- Contador de acessos
total_downloads INTEGER DEFAULT 0      -- Contador de downloads
ultimo_acesso TIMESTAMPTZ              -- Último acesso

-- Configurações
permitir_download BOOLEAN DEFAULT true
permitir_compartilhamento BOOLEAN DEFAULT true
marca_dagua BOOLEAN DEFAULT false

-- IMAGENS (Array JSONB)
imagens JSONB DEFAULT '[]'             -- Array com todas as imagens

-- Metadados
observacoes TEXT
tags TEXT[]
criado_em TIMESTAMPTZ DEFAULT now()
atualizado_em TIMESTAMPTZ DEFAULT now()
```

## 📸 ESTRUTURA DO ARRAY DE IMAGENS

Cada imagem no array `imagens` tem a seguinte estrutura:

```json
{
  "id": "uuid-da-imagem",
  "url_imagem": "https://storage.com/imagem.jpg",
  "nome_arquivo": "imagem.jpg",
  "nome_original": "IMG_001.jpg",
  "url_thumbnail": "https://storage.com/thumb.jpg",
  "url_preview": "https://storage.com/preview.jpg",
  "tamanho_arquivo": 2048576,
  "largura": 1920,
  "altura": 1080,
  "formato": "image/jpeg",
  "ordem": 1,
  "destaque": false,
  "adicionada_em": "2024-01-15T10:30:00Z"
}
```

## 🚀 FUNÇÕES HELPER DISPONÍVEIS

### 1. Adicionar Imagem
```sql
SELECT adicionar_imagem_galeria(
    'uuid-da-galeria',
    'https://storage.com/imagem.jpg',
    'imagem.jpg',
    'IMG_001.jpg',
    'https://storage.com/thumb.jpg',
    'https://storage.com/preview.jpg',
    2048576,  -- tamanho em bytes
    1920,     -- largura
    1080,     -- altura
    'image/jpeg',
    1,        -- ordem
    false     -- destaque
);
```

### 2. Remover Imagem
```sql
SELECT remover_imagem_galeria('uuid-da-galeria', 'uuid-da-imagem');
```

### 3. Reordenar Imagens
```sql
SELECT reordenar_imagens_galeria(
    'uuid-da-galeria',
    ARRAY['uuid-img1', 'uuid-img2', 'uuid-img3']::uuid[]
);
```

### 4. Buscar Galeria Pública
```sql
SELECT * FROM buscar_galeria_publica('slug-da-galeria', 'senha-opcional');
```

### 5. Listar Galerias do Usuário
```sql
SELECT * FROM listar_galerias_usuario();
```

## 💻 EXEMPLOS DE USO NO FRONTEND

### 1. Criar Nova Galeria
```typescript
const novaGaleria = await supabase
  .from('galeria')
  .insert({
    titulo: 'Casamento João e Maria',
    descricao: 'Fotos do casamento realizado em 15/12/2024',
    user_id: user.id,
    cliente_id: clienteId,
    evento_id: eventoId,
    data_evento: '2024-12-15',
    senha_acesso: 'casamento2024'
  })
  .select()
  .single();
```

### 2. Adicionar Múltiplas Imagens
```typescript
const uploadImagens = async (galeriaId: string, files: File[]) => {
  for (const file of files) {
    // 1. Upload do arquivo
    const { data: uploadData } = await supabase.storage
      .from('galerias')
      .upload(`${galeriaId}/${file.name}`, file);
    
    // 2. Adicionar à galeria
    await supabase.rpc('adicionar_imagem_galeria', {
      p_galeria_id: galeriaId,
      p_url_imagem: uploadData.path,
      p_nome_arquivo: file.name,
      p_nome_original: file.name,
      p_tamanho_arquivo: file.size,
      p_formato: file.type,
      p_ordem: files.indexOf(file)
    });
  }
};
```

### 3. Buscar Galeria Pública
```typescript
const buscarGaleria = async (slug: string, senha?: string) => {
  const { data, error } = await supabase.rpc('buscar_galeria_publica', {
    p_slug: slug,
    p_senha: senha
  });
  
  if (error) throw error;
  return data;
};
```

### 4. Listar Galerias do Usuário
```typescript
const listarGalerias = async () => {
  const { data, error } = await supabase
    .from('v_galerias_completas')
    .select('*')
    .order('criado_em', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

## 🔄 MIGRAÇÃO DE DADOS

### Executar Migração
```sql
-- Migra dados da tabela antiga para a nova
SELECT * FROM migrar_entregar_imagens_para_galeria();
```

### Verificar Migração
```sql
-- Verificar galerias criadas
SELECT COUNT(*) as total_galerias FROM galeria;

-- Verificar imagens migradas
SELECT 
  COUNT(*) as total_galerias,
  SUM(jsonb_array_length(imagens)) as total_imagens
FROM galeria;
```

## 📊 BENEFÍCIOS DA NOVA ESTRUTURA

### ✅ Vantagens
1. **UM card = MÚLTIPLAS imagens** - Problema resolvido
2. **Performance superior** - Menos JOINs, queries mais rápidas
3. **Simplicidade** - Uma tabela ao invés de múltiplas
4. **Escalabilidade** - JSONB otimizado para arrays grandes
5. **Flexibilidade** - Fácil adicionar/remover/reordenar imagens
6. **Consistência** - Dados sempre sincronizados

### 🔧 Funcionalidades Automáticas
- **Slug automático** - Gerado do título
- **Contador automático** - Total de fotos atualizado automaticamente
- **Timestamps** - Criado/atualizado automaticamente
- **RLS** - Segurança por usuário
- **Índices** - Performance otimizada

## 🎯 PRÓXIMOS PASSOS

1. **Testar a nova estrutura** com dados reais
2. **Atualizar o frontend** para usar as novas funções
3. **Migrar dados existentes** usando a função de migração
4. **Remover tabela antiga** após validação completa
5. **Documentar APIs** para a equipe

## 📞 SUPORTE

Para dúvidas sobre a nova estrutura:
- Consulte as funções helper disponíveis
- Use a view `v_galerias_completas` para consultas complexas
- Verifique os comentários nas funções para detalhes 