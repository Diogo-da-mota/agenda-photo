# Documento de Requisitos (PRD) — Agenda PRO

## 1️⃣ Objetivo do Documento

Este PRD define o escopo, funcionalidades, fluxos e critérios de aceitação da página **/entrega-fotos**, uma solução simples e direta para o envio e visualização de fotos, sem necessidade de compactação (ZIP/RAR), inspirada na usabilidade do site WeTransfer.

## 2️⃣ Visão Geral da Página

A rota **/entrega-fotos** permite que o fotógrafo envie fotos para o cliente, gerando uma URL amigável, com visualização direta das imagens e download simples. A proposta é oferecer uma experiência otimizada, responsiva e prática.

## 3️⃣ Estrutura da Rota

### Rota Principal:

```
/entrega-fotos
```

### Rota Dinâmica com Slug (URL amigável):

```
/entrega-fotos/[slug-do-titulo]
```

Exemplo: `/entrega-fotos/casamento-juliana-leo`

## 4️⃣ Tabela no Supabase — `entregar_fotos`

| Campo           | Descrição                                 |
| --------------- | ----------------------------------------- |
| id              | ID único                                  |
| cliente\_id     | Referência ao cliente                     |
| evento\_id      | (opcional) Referência ao evento           |
| titulo          | Título da galeria (usado como slug)       |
| descricao       | Descrição resumida                        |
| data\_evento    | Data do evento                            |
| data\_entrega   | Data de envio das fotos                   |
| status          | Status da entrega (ativo, expirado, etc.) |
| total\_fotos    | Contagem total das imagens                |
| link\_galeria   | URL completa da galeria                   |
| senha\_acesso   | (opcional) Senha para acesso              |
| data\_expiracao | Data de expiração do link                 |
| observacoes     | Campo de observações gerais               |
| created\_at     | Data de criação                           |
| updated\_at     | Data de atualização                       |
| created\_by     | ID do usuário que criou                   |
| clientes        | Relacionamento com tabela de clientes     |

## 5️⃣ Requisitos Funcionais

* **RF1**: Campo de **upload múltiplo** de imagens
* **RF2**: Campo de **título** (obrigatório) → define o slug da URL
* **RF3**: Campo opcional de descrição, data do evento, e observações
* **RF4**: Ao clicar em "Enviar Galeria", salvar dados na tabela e redirecionar para `/entrega-fotos/[slug]`
* **RF5**: Página da galeria com **visualização de todas as imagens** (grid responsivo)
* **RF6**: Botão para **baixar imagem individual** (sem ZIP)
* **RF7**: Botão "Salvar todas na galeria" (em dispositivos móveis)
* **RF8**: Campo opcional de **senha de acesso**
* **RF9**: Galeria expira com base no campo `data_expiracao`

## 6️⃣ Requisitos Não Funcionais

* **RNF1**: Interface 100% responsiva
* **RNF2**: Design simples, rápido e direto, com UX leve
* **RNF3**: Upload seguro com limite de tamanho por imagem (ex: 10MB)
* **RNF4**: Política RLS (Supabase) aplicada para segurança dos dados

## 7️⃣ Fluxo de Usuário — Fotógrafo

1. Acessa `/entrega-fotos`
2. Preenche o título, seleciona/arrasta imagens
3. (Opcional) Preenche data, descrição, senha ou observações
4. Clica em **“Enviar Galeria”**
5. Sistema gera slug e salva na tabela
6. Redireciona para `/entrega-fotos/[slug]` com as fotos visíveis

## 8️⃣ Fluxo de Usuário — Cliente

1. Recebe link direto
2. Acessa `/entrega-fotos/[slug]`
3. (Se houver) Digita senha de acesso
4. Visualiza imagens em grade responsiva
5. Pode baixar uma a uma ou todas de uma vez (salvar na galeria no mobile)

## 9️⃣ Critérios de Aceitação

* Upload de múltiplas fotos funcionando com pré-visualização
* URL amigável criada a partir do campo `titulo`
* Download sem compactação (ZIP/RAR proibido)
* Página carregando em < 2s com 20 imagens
* Totalmente responsivo e funcional no celular

## 🔟 Observações

* Considerar opção futura para cliente marcar favoritas
* Layout semelhante ao WeTransfer, mas com preview das imagens
* Pode incluir botão “Copiar link da galeria” após envio
* Pode usar UUID ou ID numérico oculto para evitar conflitos de slugs

---

*Este PRD descreve a página /entrega-fotos com base no banco de dados existente e nas necessidades funcionais definidas pelo projeto.*
