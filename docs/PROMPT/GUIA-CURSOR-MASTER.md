# 🎯 GUIA COMPLETO: COMO TRABALHAR COM O CURSOR (SEU ASSISTENTE IA)

> **Para iniciantes em programação | Baseado no projeto Agenda Pro**

---

## 📋 ÍNDICE RÁPIDO

1. [🎯 Como Pedir Modificações no Código](#-como-pedir-modificações-no-código)
2. [🐛 Como Lidar com Erros](#-como-lidar-com-erros)
3. [📸 Quando Enviar Screenshots](#-quando-enviar-screenshots)
4. [🎯 Templates de Pedidos](#-templates-de-pedidos)
5. [🔄 Fluxo de Trabalho Ideal](#-fluxo-de-trabalho-ideal)
6. [⚠️ Cuidados e Alertas](#️-cuidados-e-alertas)
7. [🎓 Dicas para Maximizar Ajuda](#-dicas-para-maximizar-ajuda)
8. [📚 Glossário Simples](#-glossário-simples)
9. [🚀 Situações Comuns](#-situações-comuns)

---

## 🎯 COMO PEDIR MODIFICAÇÕES NO CÓDIGO

### 🔴 REGRA DE OURO: SEJA ESPECÍFICO!
**Pense assim:** Você está dando direções para alguém que não conhece sua casa. Quanto mais detalhes, melhor!

---

### 1️⃣ **MODIFICAR UM COMPONENTE ESPECÍFICO**

#### ❌ **EXEMPLO RUIM:**
```
"O botão não está legal, muda ele"
```
**Por que é ruim:** Qual botão? Onde? O que não está legal? Como mudar?

#### ✅ **EXEMPLO BOM:**
```
"Na página de Agenda (/agenda), no formulário de criar evento, 
o botão 'Salvar' está muito pequeno. Quero que ele fique 
com a mesma altura dos botões 'Cancelar' e 'WhatsApp'."
```

#### 📝 **TEMPLATE PARA COPIAR:**
```
CURSOR: Na página [NOME DA PÁGINA] (rota /[X]), 
no componente [NOME DO COMPONENTE/SEÇÃO], 
o elemento [BOTÃO/CAMPO/TEXTO/etc] está [PROBLEMA].
Quero que [SOLUÇÃO ESPECÍFICA].
```

#### 🎯 **EXEMPLOS PRÁTICOS DO SEU PROJETO:**

**Para mudar cor de botão:**
```
CURSOR: Na página Dashboard (/dashboard), no card "Receitas do Mês", 
o botão "Ver Detalhes" está com cor azul. 
Quero que fique verde como os outros botões de sucesso do site.
```

**Para mudar tamanho de texto:**
```
CURSOR: Na página de Clientes (/clientes), na tabela de clientes, 
o nome dos clientes está muito pequeno. 
Quero que o texto seja maior, como o tamanho dos títulos dos cards no Dashboard.
```

**Para reposicionar elemento:**
```
CURSOR: Na página Financeiro (/financeiro), o botão "Nova Transação" 
está no canto inferior direito. 
Quero que fique no canto superior direito, ao lado do título "Transações".
```

---

### 2️⃣ **ADICIONAR NOVA FUNCIONALIDADE**

#### ❌ **EXEMPLO RUIM:**
```
"Quero um sistema de notificações"
```

#### ✅ **EXEMPLO BOM:**
```
"Quero adicionar um contador de notificações no cabeçalho do dashboard.
Deve mostrar quantos eventos têm hoje e aparecer com um número vermelho
ao lado do ícone de sino. Quando o usuário clicar, deve abrir uma lista
com os eventos do dia."
```

#### 📝 **TEMPLATE PARA COPIAR:**
```
CURSOR: Quero adicionar [FUNCIONALIDADE] na página [X].
Deve aparecer [LOCALIZAÇÃO ESPECÍFICA].
Quando o usuário [AÇÃO], deve [RESULTADO].
É para usuário [FOTÓGRAFO/CLIENTE].
```

#### 🎯 **EXEMPLOS PRÁTICOS:**

**Nova funcionalidade simples:**
```
CURSOR: Quero adicionar um botão "Duplicar Evento" na página de Agenda.
Deve aparecer ao lado dos botões "Editar" e "Excluir" de cada evento.
Quando o usuário clicar, deve abrir o formulário preenchido com os dados
do evento original, mas com data em branco para escolher nova data.
É para o fotógrafo.
```

**Nova página:**
```
CURSOR: Quero criar uma página "Backup de Dados" no menu administrativo.
Deve aparecer no menu lateral entre "Configurações" e "Diagnóstico".
A página deve ter um botão "Baixar Backup" que gera um arquivo Excel
com todos os clientes, eventos e transações do fotógrafo.
```

---

### 3️⃣ **CORRIGIR LAYOUT/DESIGN**

#### ❌ **EXEMPLO RUIM:**
```
"A página está feia no celular"
```

#### ✅ **EXEMPLO BOM:**
```
"No celular, na página de Clientes, os cartões dos clientes estão 
muito pequenos e o texto está cortado. Quero que cada cartão 
ocupe a largura total da tela e o texto fique em duas linhas."
```

#### 📝 **TEMPLATE PARA COPIAR:**
```
CURSOR: No [DISPOSITIVO] (celular/tablet/desktop), 
na página [X], o [ELEMENTO] está [PROBLEMA ESPECÍFICO].
Quero que [SOLUÇÃO COM DETALHES VISUAIS].
```

#### 🎯 **EXEMPLOS PRÁTICOS:**

**Problema de responsividade:**
```
CURSOR: No celular, na página Financeiro, a tabela de transações 
está cortada nas laterais. Quero que a tabela role horizontalmente 
ou que empilhe as informações verticalmente em cards.
```

**Problema de cores:**
```
CURSOR: No modo escuro, na página Dashboard, o texto dos cards 
está muito claro e não consigo ler. Quero que o texto seja 
mais escuro ou que o fundo dos cards seja mais claro.
```

**Problema de espaçamento:**
```
CURSOR: Na página de Agenda, os eventos estão muito colados uns 
nos outros. Quero um espaço de 10px entre cada evento, igual 
ao espaçamento dos cards no Dashboard.
```

---

### 4️⃣ **MODIFICAR BANCO DE DADOS**

#### ⚠️ **ATENÇÃO:** Mudanças no banco são DELICADAS! Sempre pergunte antes.

#### ❌ **EXEMPLO RUIM:**
```
"Adiciona mais um campo na tabela"
```

#### ✅ **EXEMPLO BOM:**
```
"Quero adicionar um campo 'Data de Nascimento' na tabela de clientes.
Deve ser opcional (não obrigatório) e aparecer no formulário de cadastro
entre 'Email' e 'Observações'. Preciso saber se isso vai quebrar algo."
```

#### 📝 **TEMPLATE PARA COPIAR:**
```
CURSOR: Quero [ADICIONAR/MODIFICAR/REMOVER] [CAMPO/TABELA] [NOME].
Deve [FUNCIONALIDADE ESPECÍFICA].
É obrigatório ou opcional? [RESPOSTA]
Vai aparecer onde na interface? [LOCALIZAÇÃO]
Pode quebrar algo existente? Preciso fazer backup antes?
```

---

## 🐛 COMO LIDAR COM ERROS

### 🟢 **ERROS SIMPLES** (você consegue resolver)

#### 1️⃣ **Página em branco** - ⚡ Solução: Atualizar navegador (F5)
- 🔍 **Como identificar:** Tela totalmente branca, sem nada
- 📋 **O que fazer primeiro:** Apertar F5 ou Ctrl+F5
- 💬 **Se não resolver:** "CURSOR: Página [X] está em branco mesmo depois de atualizar"

#### 2️⃣ **Botão não funciona** - ⚡ Solução: Verificar se está logado
- 🔍 **Como identificar:** Clica no botão e nada acontece
- 📋 **O que fazer primeiro:** Fazer logout e login novamente
- 💬 **Se não resolver:** "CURSOR: Botão [NOME] na página [X] não responde ao clique"

#### 3️⃣ **Imagem não carrega** - ⚡ Solução: Verificar conexão
- 🔍 **Como identificar:** Ícone de imagem quebrada ou quadrado cinza
- 📋 **O que fazer primeiro:** Verificar internet, tentar outra imagem
- 💬 **Se não resolver:** "CURSOR: Upload de imagem não funciona na página [X]"

#### 4️⃣ **Demora para carregar** - ⚡ Solução: Aguardar 30 segundos
- 🔍 **Como identificar:** Círculo girando por muito tempo
- 📋 **O que fazer primeiro:** Aguardar, verificar internet
- 💬 **Se não resolver:** "CURSOR: Página [X] demora mais de 30 segundos para carregar"

---

### 🔴 **ERROS COMPLEXOS** (precisa da minha ajuda)

#### 🔍 **COMO SABER QUE É COMPLEXO:**
- Mensagem de erro em inglês aparece na tela
- Console do navegador (F12) mostra texto em vermelho
- Funcionalidade parou de funcionar de repente
- Erro acontece só em situação específica

#### 📋 **INFORMAÇÕES PARA COLETAR:**

**1. Abrir Console (F12):**
- No Chrome/Edge: F12 → aba "Console"
- Procurar texto em vermelho
- Copiar TUDO que está em vermelho

**2. Anotar contexto:**
- Que página você estava?
- O que você clicou/digitou?
- Que hora aconteceu?
- Acontece sempre ou às vezes?

#### 📝 **TEMPLATE PARA ERROS COMPLEXOS:**
```
CURSOR: Estou com erro na página [NOME DA PÁGINA].

🔴 ERRO NO CONSOLE:
[Colar aqui todo o texto vermelho do console F12]

📍 COMO REPRODUZIR:
1. Entro na página [X]
2. Clico em [Y]
3. Digito [Z]
4. Erro aparece

⏰ QUANDO: [sempre/às vezes/primeira vez]
🌐 NAVEGADOR: [Chrome/Firefox/Edge]
📱 DISPOSITIVO: [celular/computador]
```

---

### 🎯 **ERROS ESPECÍFICOS DO AGENDA PRO**

#### 1️⃣ **ERROS DE SUPABASE (banco de dados)**
**Sinais:** Mensagens tipo "Network error", "Failed to fetch", "RLS policy"

```
CURSOR: Erro de banco de dados.

🔴 MENSAGEM: [colar mensagem exata]
📍 ACONTECE QUANDO: [criar cliente/salvar evento/fazer login/etc]
📄 PÁGINA: [onde aconteceu]

Consegue verificar se é problema de conexão com Supabase?
```

#### 2️⃣ **ERROS DE AUTENTICAÇÃO (login/logout)**
**Sinais:** "Invalid credentials", "Not authenticated", redirecionamento para login

```
CURSOR: Problema de login/logout.

🔴 SINTOMA: [não consegue entrar/foi deslogado automaticamente/etc]
👤 USUÁRIO: [email que está usando]
🔄 JÁ TENTEI: [limpar cache/logout e login/etc]

Pode verificar se é problema de sessão?
```

#### 3️⃣ **ERROS DE UPLOAD DE IMAGEM**
**Sinais:** "File too large", "Upload failed", imagem não aparece

```
CURSOR: Upload de imagem não funciona.

🖼️ TIPO DE ARQUIVO: [JPG/PNG/tamanho]
📍 ONDE: [logo da empresa/foto perfil/etc]
🔴 MENSAGEM: [se apareceu alguma]

Pode verificar configurações de storage?
```

#### 4️⃣ **ERROS DE ROTA (página não encontrada)**
**Sinais:** "404 Not Found", "Cannot GET", página em branco

```
CURSOR: Página não carrega.

🌐 URL: [copiar link completo da barra de endereços]
🔗 COMO CHEGUEI: [cliquei em X/digitei endereço/etc]
🎯 DEVERIA IR PARA: [que página era para abrir]

Pode verificar as rotas?
```

---

## 📸 QUANDO ENVIAR SCREENSHOTS

### ✅ **SEMPRE ENVIE SCREENSHOT PARA:**

#### 1️⃣ **PROBLEMAS VISUAIS**
- Layout quebrado no celular
- Cores estranhas
- Texto cortado
- Elementos sobrepostos

#### 2️⃣ **MOSTRAR O QUE QUER ALTERAR**
- "Quero que este botão fique assim"
- "Esta tabela está bagunçada"
- "Este card está muito pequeno"

#### 3️⃣ **ERROS VISUAIS NA TELA**
- Mensagens de erro que aparecem
- Páginas em branco
- Carregamento infinito

#### 4️⃣ **CONSOLE DE ERROS**
- F12 → Console → print da tela com erros em vermelho

---

### 📱 **COMO TIRAR SCREENSHOTS ÚTEIS:**

#### **Para PROBLEMAS VISUAIS:**
```
📱 Celular: Screenshot da tela toda
💻 Desktop: Screenshot da área problemática
🔍 Zoom: Se o problema é pequeno, dar zoom antes
```

#### **Para ERROS TÉCNICOS:**
```
1. Abrir F12
2. Ir na aba "Console"
3. Screenshot mostrando erros vermelhos
4. Se não couber, múltiplas imagens
```

#### **Para MOSTRAR LOCALIZAÇÃO:**
```
1. Screenshot da página toda
2. Círculo vermelho ou seta apontando onde é o problema
3. Se necessário, múltiplas imagens (antes/depois)
```

---

### ❌ **NÃO PRECISA ENVIAR SCREENSHOT PARA:**
- Perguntas sobre código
- Pedidos de funcionalidades novas (só descrever)
- Problemas de performance/lentidão
- Dúvidas conceituais

---

## 🎯 TEMPLATES DE PEDIDOS

### 📋 **TEMPLATE 1: MODIFICAÇÃO VISUAL**
```
CURSOR: Quero modificar algo visual.

📍 LOCALIZAÇÃO:
- Página: [/dashboard, /agenda, /clientes, etc]
- Seção: [cabeçalho, card, formulário, tabela, etc]
- Elemento: [botão, texto, imagem, etc]

🎨 MUDANÇA DESEJADA:
- Está assim: [descrever estado atual]
- Quero assim: [descrever como quer que fique]
- Motivo: [por que quer mudar]

📱 DISPOSITIVOS: [todos/só celular/só desktop]
```

### 📋 **TEMPLATE 2: ERRO/PROBLEMA**
```
CURSOR: Tenho um problema técnico.

🔴 ERRO/PROBLEMA:
[Descrever ou colar mensagem de erro]

📍 ONDE ACONTECE:
- Página: [qual página]
- Ação: [o que estava fazendo]

🔄 COMO REPRODUZIR:
1. [primeiro passo]
2. [segundo passo]
3. [quando o erro aparece]

🌐 CONTEXTO:
- Navegador: [Chrome/Firefox/etc]
- Dispositivo: [celular/desktop]
- Frequência: [sempre/às vezes/primeira vez]

⚡ JÁ TENTEI:
[o que já fez para tentar resolver]
```

### 📋 **TEMPLATE 3: NOVA FUNCIONALIDADE**
```
CURSOR: Quero nova funcionalidade.

🎯 O QUE QUERO:
[Descrição clara da funcionalidade]

📍 ONDE DEVE APARECER:
- Página: [qual página]
- Localização: [menu, cabeçalho, meio da página, etc]

👤 PARA QUEM:
[fotógrafo/cliente/ambos]

🔄 COMO DEVE FUNCIONAR:
1. Usuário [ação 1]
2. Sistema [resposta 1]
3. Usuário [ação 2]
4. Resultado final [o que acontece]

💡 EXEMPLO SIMILAR:
[se existe algo parecido no sistema atual]
```

### 📋 **TEMPLATE 4: PROBLEMA DE PERFORMANCE**
```
CURSOR: Problema de velocidade/lentidão.

🐌 SINTOMA:
[demora para carregar/trava/etc]

📍 ONDE:
- Página: [qual página]
- Ação específica: [o que faz quando fica lento]

⏱️ TEMPO:
- Deveria demorar: [X segundos]
- Está demorando: [Y segundos]

📊 CONTEXTO:
- Quantidade de dados: [poucos/muitos clientes, eventos, etc]
- Horário: [manhã/tarde/noite]
- Frequência: [sempre/às vezes]

🌐 DISPOSITIVO:
[celular/computador/ambos]
```

### 📋 **TEMPLATE 5: DÚVIDA/PERGUNTA**
```
CURSOR: Tenho uma dúvida.

❓ PERGUNTA:
[Sua dúvida específica]

🎯 CONTEXTO:
[Por que está perguntando/o que quer fazer]

💭 JÁ PROCUREI:
[onde já tentou encontrar a resposta]

📝 EXEMPLO:
[se possível, dar exemplo concreto]
```

---

## 🔄 FLUXO DE TRABALHO IDEAL

### 🚀 **ANTES DE PEDIR QUALQUER MUDANÇA**

#### 1️⃣ **FAÇA ESTAS PERGUNTAS:**
```
✅ O que exatamente quero mudar?
✅ Onde está localizado?
✅ Por que quero mudar?
✅ Como deve ficar depois?
✅ Vai afetar outras partes do sistema?
```

#### 2️⃣ **TESTE PRIMEIRO:**
```
✅ Tentei atualizar a página? (F5)
✅ Tentei em outro navegador?
✅ Tentei fazer logout/login?
✅ O problema acontece sempre?
```

#### 3️⃣ **BACKUP MENTAL:**
```
✅ Sei como está funcionando agora?
✅ Sei voltar se der problema?
✅ É mudança crítica (banco de dados)?
```

---

### ⚙️ **DURANTE A MODIFICAÇÃO**

#### 👀 **ACOMPANHE O PROCESSO:**
- Leia o que estou fazendo
- Se não entender algo, pergunte
- Se achar que está indo para direção errada, fale

#### 🛑 **QUANDO INTERROMPER:**
```
🚨 Se aparecer erro vermelho no console
🚨 Se a página ficou em branco
🚨 Se perdeu dados importantes
🚨 Se não consegue mais fazer login
```

#### 💬 **COMO INTERROMPER:**
```
"CURSOR: PARA! Algo deu errado: [descrever o problema]"
```

---

### ✅ **DEPOIS DA MODIFICAÇÃO**

#### 🧪 **TESTES OBRIGATÓRIOS:**
```
1. ✅ A mudança funcionou como esperado?
2. ✅ Login/logout ainda funciona?
3. ✅ Outras páginas não quebraram?
4. ✅ Funciona no celular e desktop?
5. ✅ Banco de dados não perdeu dados?
```

#### 📝 **CHECKLIST RÁPIDO:**
```
✅ Dashboard carrega normalmente
✅ Consigo criar/editar/deletar cliente
✅ Consigo criar/editar/deletar evento
✅ Página financeiro funciona
✅ Sistema de login funciona
```

#### 🔄 **SE ALGO QUEBROU:**
```
"CURSOR: A mudança funcionou, mas agora [X] não funciona mais.
Pode reverter ou corrigir?"
```

---

## ⚠️ CUIDADOS E ALERTAS

### 🚨 **MUDANÇAS PERIGOSAS** (sempre perguntar antes)

#### 1️⃣ **BANCO DE DADOS:**
```
❌ Deletar tabelas ou campos
❌ Mudar tipos de dados (texto para número)
❌ Remover relacionamentos entre tabelas
❌ Alterar chaves primárias
```

**✅ Como pedir com segurança:**
```
"CURSOR: Quero [mudança no banco]. 
Isso pode quebrar algo? Preciso fazer backup?"
```

#### 2️⃣ **AUTENTICAÇÃO:**
```
❌ Mudar sistema de login
❌ Alterar políticas de segurança
❌ Modificar proteção de rotas
```

#### 3️⃣ **ARQUIVOS PRINCIPAIS:**
```
❌ Deletar components inteiros
❌ Mudar estrutura de pastas
❌ Alterar configurações do Supabase
```

---

### 🛡️ **QUANDO FAZER BACKUP ANTES:**

#### **SEMPRE:**
- Mudanças no banco de dados
- Alterações em arquivos de configuração
- Modificações em sistema de login
- Grandes refatorações de código

#### **COMO FAZER BACKUP SIMPLES:**
```
1. Download dos arquivos importantes
2. Export dos dados do Supabase
3. Anotar configurações atuais
```

---

### ⚡ **MUDANÇAS QUE PRECISAM TESTE ESPECIAL:**

#### **FINANCEIRO:**
```
✅ Testar criação de transação
✅ Verificar cálculos de totais
✅ Confirmar filtros de data
✅ Validar relatórios
```

#### **AGENDA:**
```
✅ Criar evento
✅ Editar evento existente
✅ Verificar cores por status
✅ Testar integração WhatsApp
```

#### **CLIENTES:**
```
✅ Adicionar novo cliente
✅ Editar cliente existente
✅ Relacionamento com eventos
✅ Busca e filtros
```

---

### 🚫 **NUNCA FAÇA SOZINHO:**

```
❌ Mudanças diretas no Supabase Dashboard
❌ Editar arquivos de configuração manualmente
❌ Deletar arquivos que não conhece
❌ Mexer em variáveis de ambiente (.env)
❌ Alterar configurações de produção
```

---

## 🎓 DICAS PARA MAXIMIZAR AJUDA

### 🎯 **SEJA ESPECÍFICO COM LOCALIZAÇÕES:**

#### ✅ **BOM:**
```
"Na página Dashboard (/dashboard), no card azul 'Próximos Eventos', 
na lista de eventos, quero que o nome do cliente seja bold."
```

#### ❌ **RUIM:**
```
"Quero o nome do cliente em negrito."
```

---

### 🎨 **DESCREVA CORES E TAMANHOS:**

#### ✅ **PARA CORES:**
```
"Verde como o botão de sucesso"
"Azul igual ao cabeçalho"
"Cinza claro como o fundo dos cards"
"Vermelho de erro como as mensagens de validação"
```

#### ✅ **PARA TAMANHOS:**
```
"Grande como o título da página"
"Mesmo tamanho dos outros botões"
"Altura igual aos campos de input"
"Largura de 50% da tela"
```

---

### 📍 **EXPLIQUE POSICIONAMENTO:**

#### ✅ **BOM:**
```
"No canto superior direito"
"Entre o campo 'Email' e 'Telefone'"
"Embaixo da tabela de clientes"
"Ao lado do botão 'Salvar'"
"No centro da página"
```

---

### 👥 **DESCREVA FLUXOS DE USUÁRIO:**

#### ✅ **EXEMPLO:**
```
"Quando o fotógrafo entra na página de clientes, 
vê a lista de todos os clientes. 
Quando clica em um cliente, 
abre uma página com detalhes. 
Quero adicionar um botão 'Ver Eventos' 
que mostra todos os eventos desse cliente."
```

---

### ⚡ **ECONOMIZE TEMPO:**

#### **SEMPRE INCLUA:**
```
✅ Nome da página
✅ Localização específica
✅ Comportamento atual
✅ Comportamento desejado
✅ Motivo da mudança
```

#### **AGRUPE MUDANÇAS RELACIONADAS:**
```
✅ "Quero mexer em 3 botões da página X"
❌ 3 pedidos separados para cada botão
```

#### **SEPARE MUDANÇAS DIFERENTES:**
```
✅ Mudanças visuais em um pedido
✅ Mudanças de funcionalidade em outro
✅ Correções de erro em outro
```

---

## 📚 GLOSSÁRIO SIMPLES

### 🏗️ **ESTRUTURA (como as coisas se organizam)**

#### **Component (Componente)**
```
🔍 O que é: Peça reutilizável da interface
🎯 Exemplo seu: EventForm = formulário de criar evento
📍 Onde está: src/components/agenda/EventForm.tsx
💡 Pense como: Peça de LEGO que você usa várias vezes
```

#### **Hook**
```
🔍 O que é: Funcionalidade reutilizável
🎯 Exemplo seu: useAuth = gerencia login do usuário
📍 Onde está: src/hooks/useAuth.tsx
💡 Pense como: Ferramenta especializada (martelo, chave de fenda)
```

#### **Route (Rota)**
```
🔍 O que é: Endereço de uma página
🎯 Exemplo seu: /dashboard = página principal do fotógrafo
📍 Onde está: src/AppRoutes.tsx
💡 Pense como: Endereço de uma casa na internet
```

#### **State (Estado)**
```
🔍 O que é: Informação que muda na tela
🎯 Exemplo seu: lista de clientes carregada
📍 Onde está: dentro dos components
💡 Pense como: Memória temporária da página
```

---

### 🔗 **CONEXÕES (como as coisas se comunicam)**

#### **Props**
```
🔍 O que é: Informações passadas entre components
🎯 Exemplo seu: dados do evento para o formulário
💡 Pense como: Passar um recado de um lugar para outro
```

#### **API**
```
🔍 O que é: Ponte entre seu site e o banco de dados
🎯 Exemplo seu: Supabase API
💡 Pense como: Garçom que leva seu pedido para a cozinha
```

#### **Database (Banco de dados)**
```
🔍 O que é: Onde ficam salvos todos os dados
🎯 Exemplo seu: Supabase PostgreSQL
📍 Tabelas: clientes, agenda_eventos, financeiro_transacoes
💡 Pense como: Arquivo gigante organizado em gavetas
```

#### **Authentication (Autenticação)**
```
🔍 O que é: Sistema que verifica quem você é
🎯 Exemplo seu: Login com email/senha
💡 Pense como: Porteiro de prédio que confere RG
```

---

### 🎨 **INTERFACE (o que você vê na tela)**

#### **Frontend**
```
🔍 O que é: Tudo que você vê e clica
🎯 Exemplo seu: Páginas, botões, formulários
💡 Pense como: Fachada da loja
```

#### **Backend**
```
🔍 O que é: Parte invisible que processa dados
🎯 Exemplo seu: Supabase (banco + APIs)
💡 Pense como: Cozinha do restaurante
```

#### **UI (Interface do Usuário)**
```
🔍 O que é: Como as coisas aparecem na tela
🎯 Exemplo seu: Cores, fontes, layout dos cards
💡 Pense como: Decoração e organização da casa
```

#### **UX (Experiência do Usuário)**
```
🔍 O que é: Como é fácil/difícil usar o sistema
🎯 Exemplo seu: Quantos cliques para criar um evento
💡 Pense como: Se a casa é confortável de morar
```

---

### 💻 **TECNOLOGIAS (ferramentas que fazem funcionar)**

#### **CSS**
```
🔍 O que é: Linguagem que define aparência
🎯 Exemplo seu: Cores azuis, tamanhos de botão
💡 Pense como: Tinta e decoração da casa
```

#### **HTML**
```
🔍 O que é: Estrutura básica das páginas
🎯 Exemplo seu: Títulos, parágrafos, botões
💡 Pense como: Esqueleto da casa (paredes, portas)
```

#### **JavaScript**
```
🔍 O que é: Linguagem que faz coisas acontecerem
🎯 Exemplo seu: Clique no botão → salva no banco
💡 Pense como: Eletricidade que faz tudo funcionar
```

#### **TypeScript**
```
🔍 O que é: JavaScript com verificação de erros
🎯 Exemplo seu: 95% do seu código
💡 Pense como: JavaScript com corretor ortográfico
```

---

## 🚀 SITUAÇÕES COMUNS

### 1️⃣ **"QUERO MUDAR A COR DE UM BOTÃO"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Quero mudar cor de botão.

📍 LOCALIZAÇÃO:
- Página: [/dashboard, /agenda, etc]
- Botão: [nome exato do botão]
- Onde está: [dentro de que seção/card]

🎨 MUDANÇA:
- Cor atual: [azul/verde/vermelho/etc]
- Cor desejada: [qual cor quer]
- Motivo: [por que quer mudar]

🎯 REFERÊNCIA:
- "Igual ao botão X da página Y"
- Ou código da cor se souber: #FF0000
```

#### ✅ **EXEMPLO PRÁTICO:**
```
CURSOR: Quero mudar cor de botão.

📍 LOCALIZAÇÃO:
- Página: Dashboard (/dashboard)
- Botão: "Ver Mais" 
- Onde está: No card "Próximos Eventos"

🎨 MUDANÇA:
- Cor atual: Azul
- Cor desejada: Verde 
- Motivo: Para ficar igual aos outros botões de ação

🎯 REFERÊNCIA:
- Igual ao botão "Adicionar Cliente" da página Clientes
```

---

### 2️⃣ **"A PÁGINA NÃO CARREGA NO MOBILE"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Problema de carregamento no celular.

📱 DISPOSITIVO:
- Celular: [iPhone/Android/marca]
- Navegador: [Chrome/Safari/Firefox]
- Tamanho da tela: [pequena/média/grande]

🔴 PROBLEMA:
- Página: [qual página]
- Sintoma: [tela branca/carrega infinito/erro/etc]
- Quando: [sempre/às vezes/primeira vez]

🔄 JÁ TENTEI:
- [x] Atualizar página (F5)
- [x] Fechar e abrir navegador
- [x] Logout e login
- [ ] Outro navegador

📷 SCREENSHOT: [anexar se possível]
```

---

### 3️⃣ **"O FORMULÁRIO NÃO ESTÁ SALVANDO"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Formulário não salva dados.

📍 LOCALIZAÇÃO:
- Página: [qual página]
- Formulário: [criar cliente/evento/transação/etc]

🔴 COMPORTAMENTO:
- Preencho os campos: [quais campos]
- Clico em: [nome do botão]
- Acontece: [nada/erro/carrega infinito]
- Deveria: [salvar e voltar/mostrar mensagem/etc]

📊 DADOS DE TESTE:
- Nome: [exemplo que está usando]
- Email: [exemplo]
- Telefone: [exemplo]
- [outros campos...]

🔍 CONSOLE ERROR: 
[Abrir F12 → Console → copiar erros vermelhos]
```

---

### 4️⃣ **"QUERO ADICIONAR UM CAMPO NOVO"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Quero adicionar novo campo em formulário.

📍 ONDE:
- Formulário: [criar cliente/evento/transação]
- Posição: [entre campo X e Y / no final / no início]

📝 CAMPO:
- Nome: [como vai chamar]
- Tipo: [texto/número/data/seleção/sim ou não]
- Obrigatório: [sim/não]
- Exemplo de valor: [o que o usuário digitaria]

🎯 FUNCIONALIDADE:
- Para que serve: [qual o objetivo]
- Como vai usar: [onde vai aparecer depois de salvo]

⚠️ BANCO DE DADOS:
- Pode criar nova coluna na tabela?
- Precisa fazer backup antes?
```

#### ✅ **EXEMPLO PRÁTICO:**
```
CURSOR: Quero adicionar novo campo em formulário.

📍 ONDE:
- Formulário: Criar/Editar Cliente
- Posição: Entre "Email" e "Observações"

📝 CAMPO:
- Nome: "Data de Nascimento"
- Tipo: Data (calendário)
- Obrigatório: Não
- Exemplo: 15/03/1990

🎯 FUNCIONALIDADE:
- Para que serve: Saber idade para ofertas especiais
- Como vai usar: Mostrar na lista de clientes e relatórios

⚠️ BANCO DE DADOS:
- Pode criar nova coluna na tabela clientes?
- Preciso fazer backup antes?
```

---

### 5️⃣ **"A IMAGEM NÃO FAZ UPLOAD"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Upload de imagem não funciona.

📍 ONDE:
- Página: [configurações/perfil/etc]
- Campo: [logo empresa/foto perfil/etc]

🖼️ ARQUIVO:
- Tipo: [JPG/PNG/GIF]
- Tamanho: [aproximado em MB]
- Nome: [exemplo.jpg]

🔴 COMPORTAMENTO:
- Clico em: [selecionar arquivo/arrastar]
- Escolho arquivo: [sim/não]
- Acontece: [nada/carrega/erro]
- Mensagem de erro: [copiar exata]

📱 DISPOSITIVO:
- [Celular/Computador]
- Navegador: [Chrome/Safari/etc]

🔍 CONSOLE ERROR:
[F12 → Console → copiar erros vermelhos]
```

---

### 6️⃣ **"O USUÁRIO NÃO CONSEGUE FAZER LOGIN"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Problema de login.

👤 USUÁRIO:
- Email: [email que está tentando]
- Senha: [confirmar se está correta]
- Tipo: [fotógrafo/cliente]
- Já funcionou antes: [sim/não]

🔴 SINTOMA:
- Digita email/senha
- Clica "Entrar"
- Acontece: [mensagem erro/nada/carrega infinito]
- Mensagem exata: [copiar]

🔄 JÁ TENTAMOS:
- [ ] Verificar caps lock
- [ ] Tentar senha em outro site
- [ ] Usar "Esqueci senha"
- [ ] Tentar outro navegador
- [ ] Limpar cache

🌐 CONTEXTO:
- Primeira vez usando: [sim/não]  
- Funcionava ontem: [sim/não]
- Outros usuários: [têm problema também]
```

---

### 7️⃣ **"QUERO ESCONDER ALGO PARA DETERMINADO USUÁRIO"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Controle de acesso/visibilidade.

👤 USUÁRIOS:
- Esconder para: [fotógrafo/cliente/admin]
- Mostrar para: [quem deve ver]

📍 O QUE ESCONDER:
- Página: [qual página]
- Elemento: [botão/seção/menu/campo]
- Nome específico: [nome exato]

🎯 REGRA:
- Quando esconder: [sempre/em situação X]
- Por que: [motivo da restrição]

✅ EXEMPLO:
- Cliente não deve ver: "Botão Deletar Cliente"
- Fotógrafo não deve ver: "Página Admin"
- etc...
```

---

### 8️⃣ **"A PÁGINA ESTÁ MUITO LENTA"**

#### 📝 **TEMPLATE COMPLETO:**
```
CURSOR: Problema de performance/lentidão.

🐌 SINTOMA:
- Página: [qual página específica]
- Demora: [quantos segundos aproximadamente]
- Quando: [sempre/com muitos dados/horário específico]

📊 CONTEXTO DOS DADOS:
- Quantos clientes: [aproximadamente]
- Quantos eventos: [aproximadamente]
- Quantas transações: [aproximadamente]

⚡ AÇÕES LENTAS:
- Carregar página: [sim/não - tempo]
- Fazer busca: [sim/não - tempo]  
- Salvar dados: [sim/não - tempo]
- Abrir modal/formulário: [sim/não - tempo]

🌐 AMBIENTE:
- Dispositivo: [celular/computador]
- Internet: [boa/ruim/móvel/wifi]
- Navegador: [Chrome/Safari/etc]
- Horário: [manhã/tarde/noite]

📱 COMPARAÇÃO:
- Outras páginas: [normais/lentas também]
- Outros dispositivos: [mesmo problema]
```

---

## 🎯 CHECKLIST FINAL

### ✅ **ANTES DE ENVIAR QUALQUER PEDIDO:**

```
□ Sei exatamente onde está o problema/mudança?
□ Tentei resolver sozinho primeiro?
□ Tenho informações específicas (página, botão, erro)?
□ Expliquei COMO está e COMO quero que fique?
□ Incluí o motivo da mudança?
□ Se é erro, copiei a mensagem exata?
□ Se é visual, considerei enviar screenshot?
□ Usei um dos templates acima?
```

### ✅ **PALAVRAS MÁGICAS PARA USAR:**

```
🎯 "Na página [X], no componente [Y]..."
🎯 "Quero que [estado atual] vire [estado desejado]..."
🎯 "Está acontecendo [X], deveria acontecer [Y]..."
🎯 "Posso fazer backup antes desta mudança?"
🎯 "Isso pode quebrar algo importante?"
```

### ✅ **LEMBRE-SE:**

```
💡 Sou seu assistente, não tenho pressa
💡 Prefiro perguntas demais a mudanças erradas
💡 Sempre posso reverter mudanças se necessário
💡 Melhor ser específico que genérico
💡 Screenshots ajudam muito em problemas visuais
```

---

## 🏆 RESUMO PARA SUCESSO

### 🚀 **FÓRMULA DO PEDIDO PERFEITO:**

```
LOCALIZAÇÃO + PROBLEMA ATUAL + SOLUÇÃO DESEJADA + MOTIVO

Exemplo:
"Na página Dashboard, no card Próximos Eventos, 
o texto está muito pequeno e não consigo ler no celular.
Quero que fique do mesmo tamanho do título da página
para melhorar a legibilidade."
```

### 🎯 **SEUS SUPERPODERES AGORA:**

```
✅ Sei localizar problemas exatamente
✅ Sei distinguir erros simples de complexos  
✅ Tenho templates prontos para cada situação
✅ Sei quando fazer backup antes de mudanças
✅ Sei como tirar screenshots úteis
✅ Conheço o fluxo de trabalho ideal
✅ Tenho vocabulário técnico básico
✅ Sei como economizar tempo nas conversas
```

---

**🎉 Parabéns! Agora você tem tudo para trabalhar comigo de forma super eficiente!**

**💬 Use este guia sempre que precisar. Marque como favorito e consulte os templates quando for fazer pedidos.**

**🚀 Lembre-se: quanto mais específico você for, melhor e mais rápido posso te ajudar!**

---

*Última atualização: Baseado na análise completa do Agenda Pro* 