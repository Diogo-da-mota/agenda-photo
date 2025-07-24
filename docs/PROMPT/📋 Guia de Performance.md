# Guia de Performance para Next.js + TypeScript + Supabase + Tailwind

## 🎯 OBJETIVO DO DOCUMENTO
Este guia serve para análise automatizada de performance em projetos Next.js. A LLM deve usar estas diretrizes para identificar gargalos de performance no código e sugerir otimizações específicas.

## 📊 MÉTRICAS DE REFERÊNCIA

### Core Web Vitals - Valores Alvo
- **LCP (Largest Contentful Paint):** < 2.5 segundos
- **FID (First Input Delay):** < 100 milissegundos
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600 milissegundos
- **FCP (First Contentful Paint):** < 1.8 segundos

### Métricas Next.js Específicas
- **Hydration Time:** < 1 segundo
- **Bundle Size Total:** < 500KB (gzipped)
- **Initial Page Load:** < 3 segundos
- **Route Transition:** < 200 milissegundos

## 🔍 PONTOS DE ANÁLISE OBRIGATÓRIOS

### 1. ESTRUTURA DE PÁGINAS E ROTEAMENTO

#### Problemas Críticos a Identificar:
- **Páginas sem getStaticProps/getServerSideProps quando necessário**
- **Uso desnecessário de getServerSideProps em conteúdo estático**
- **Ausência de getStaticPaths em páginas dinâmicas**
- **Páginas muito pesadas sem code splitting**
- **Imports desnecessários no _app.tsx**

#### Padrões Corretos:
```typescript
// ✅ Para conteúdo estático
export const getStaticProps: GetStaticProps = async () => {
  // Buscar dados em build time
}

// ✅ Para conteúdo dinâmico frequente
export const getServerSideProps: GetServerSideProps = async () => {
  // Buscar dados a cada requisição
}

// ✅ Para rotas dinâmicas estáticas
export const getStaticPaths: GetStaticPaths = async () => {
  // Gerar paths em build time
}
```

#### Sinais de Problemas:
- Uso de useEffect para carregar dados críticos
- Client-side fetching para conteúdo above-the-fold
- Páginas sem otimização de renderização

### 2. COMPONENTES REACT E OTIMIZAÇÕES

#### Problemas Críticos a Identificar:
- **Componentes sem React.memo quando apropriado**
- **Re-renders desnecessários por props/state**
- **Componentes pesados sem lazy loading**
- **Context providers mal posicionados**
- **Hooks mal otimizados (useMemo, useCallback ausentes)**

#### Padrões de Otimização:
```typescript
// ✅ Memoização apropriada
const ComponentePesado = React.memo(({ data }) => {
  const processedData = useMemo(() => 
    processExpensiveData(data), [data]
  );
  
  const handleClick = useCallback(() => {
    // handler logic
  }, [dependency]);
  
  return <div>{/* render */}</div>;
});

// ✅ Lazy loading de componentes
const LazyComponent = lazy(() => import('./ComponentePesado'));
```

#### Sinais de Problemas:
- Componentes renderizando a cada mudança de estado global
- Funções sendo recriadas a cada render
- Componentes pesados carregando sem necessidade imediata

### 3. INTEGRAÇÃO COM SUPABASE

#### Problemas Críticos a Identificar:
- **Queries Supabase sem otimização de campos (select)**
- **Absence de cache em queries frequentes**
- **Queries N+1 (buscar dados em loops)**
- **Não uso de RLS (Row Level Security) impactando queries**
- **Client Supabase sendo instanciado múltiplas vezes**
- **Queries grandes sem paginação**

#### Padrões de Otimização:
```typescript
// ✅ Query otimizada
const { data } = await supabase
  .from('tabela')
  .select('id, nome, email') // Apenas campos necessários
  .limit(20) // Paginação
  .order('created_at', { ascending: false });

// ✅ Client singleton
const supabase = createClientComponentClient();

// ✅ Cache com SWR/React Query
const { data } = useSWR('dados-usuarios', () => 
  supabase.from('users').select('*')
);
```

#### Sinais de Problemas:
- Select * em queries grandes
- Ausência de índices em colunas filtradas
- Queries síncronas bloqueando renderização
- Múltiplas instâncias do cliente Supabase

### 4. IMAGENS E ASSETS

#### Problemas Críticos a Identificar:
- **Uso de <img> ao invés de next/image**
- **Imagens sem lazy loading**
- **Imagens não otimizadas (formatos antigos)**
- **Dimensões não especificadas causando CLS**
- **Imagens above-the-fold com lazy loading**

#### Padrões Corretos:
```typescript
// ✅ Otimização completa
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Descrição"
  width={800}
  height={600}
  priority // Para above-the-fold
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// ✅ Para imagens dinâmicas
<Image
  src={dynamicSrc}
  alt="Descrição"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
```

#### Sinais de Problemas:
- Tags img normais para imagens importantes
- Ausência de atributo sizes em imagens responsivas
- Imagens carregando antes de serem visíveis
- Formatos pesados (JPEG/PNG) para ícones simples

### 5. TAILWIND CSS E ESTILOS

#### Problemas Críticos a Identificar:
- **CSS não purgado em produção**
- **Classes Tailwind não utilizadas no bundle**
- **Styles inline excessivos**
- **Animações CSS pesadas**
- **Fonts não otimizadas**

#### Configurações Corretas:
```javascript
// ✅ tailwind.config.js otimizado
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}

// ✅ Fonts otimizadas no _app.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

#### Sinais de Problemas:
- Bundle CSS maior que 50KB
- Fonts carregando com flash de conteúdo
- Animações causando repaint/reflow excessivo

### 6. JAVASCRIPT E TYPESCRIPT

#### Problemas Críticos a Identificar:
- **Bundle JavaScript muito grande (>500KB)**
- **Imports de bibliotecas inteiras quando só precisa de partes**
- **Código não utilizado (dead code)**
- **Polyfills desnecessários**
- **Bibliotecas duplicadas no bundle**

#### Padrões de Otimização:
```typescript
// ✅ Tree shaking correto
import { debounce } from 'lodash/debounce'; // Não: import _ from 'lodash'

// ✅ Dynamic imports
const ChartComponent = dynamic(() => 
  import('./Chart').then(mod => ({ default: mod.Chart }))
, { ssr: false });

// ✅ Lazy loading de libs pesadas
const loadChart = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

#### Sinais de Problemas:
- Imports de bibliotecas completas
- Código executando no servidor quando deveria ser client-only
- Dependências não utilizadas no package.json

### 7. CONFIGURAÇÃO NEXT.JS

#### Problemas Críticos a Identificar:
- **next.config.js sem otimizações**
- **Experimental features desnecessárias**
- **Image optimization desabilitada**
- **Compression não configurada**

#### Configuração Otimizada:
```javascript
// ✅ next.config.js otimizado
const nextConfig = {
  experimental: {
    appDir: true, // Se usando App Router
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['exemplo.com'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

#### Sinais de Problemas:
- Configuração padrão sem otimizações
- Headers desnecessários sendo enviados
- Source maps em produção

### 8. CACHE E ESTRATÉGIAS DE DADOS

#### Problemas Críticos a Identificar:
- **Ausência de cache em dados estáticos**
- **Cache headers mal configurados**
- **Revalidação desnecessária de dados**
- **SWR/React Query mal configurado**

#### Estratégias Corretas:
```typescript
// ✅ ISR (Incremental Static Regeneration)
export const getStaticProps: GetStaticProps = async () => {
  const data = await fetchData();
  
  return {
    props: { data },
    revalidate: 3600, // Revalidar a cada hora
  };
};

// ✅ Cache com SWR
const { data, error } = useSWR(
  'api/dados',
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 300000, // 5 minutos
  }
);
```

#### Sinais de Problemas:
- Dados sendo buscados a cada render
- Cache muito agressivo em dados que mudam frequentemente
- Ausência de fallback para dados em cache

## 🚨 CHECKLIST DE PROBLEMAS CRÍTICOS

### Performance Blockers (Resolver Imediatamente)
- [ ] Páginas com getServerSideProps para conteúdo estático
- [ ] Imagens above-the-fold sem priority
- [ ] Queries Supabase com select * em tabelas grandes
- [ ] Componentes pesados sem memoização
- [ ] Bundle JavaScript > 500KB
- [ ] LCP > 4 segundos
- [ ] Hydration > 2 segundos

### Performance Impactors (Resolver em Breve)
- [ ] Componentes sem lazy loading quando apropriado
- [ ] Absence de cache em dados frequentes
- [ ] CLS > 0.2 por dimensões não definidas
- [ ] Fonts sem otimização
- [ ] Animações pesadas
- [ ] Code splitting insuficiente

### Performance Optimizers (Melhorias Graduais)
- [ ] Implementar Service Worker
- [ ] Otimizar ordem de carregamento de recursos
- [ ] Preload recursos críticos
- [ ] Implementar error boundaries
- [ ] Melhorar SEO técnico
- [ ] Monitoramento de performance

## 🔧 COMANDOS DE ANÁLISE

### Para Identificar Problemas Específicos:
```bash
# Análise de bundle
npm run build && npm run analyze

# Lighthouse CI
npx @lhci/cli autorun

# Bundle analyzer
npx @next/bundle-analyzer

# Performance testing
npm run dev && open http://localhost:3000
# F12 → Lighthouse → Performance
```

## 📋 PROTOCOL DE ANÁLISE AUTOMÁTICA

### Quando Analisar Código:
1. **Verificar todas as páginas** em /pages ou /app
2. **Analisar componentes** em /components
3. **Revisar configurações** (next.config.js, tailwind.config.js)
4. **Examinar integrações** Supabase
5. **Validar estratégias** de cache e dados
6. **Identificar imports** e dependências pesadas

### Relatório de Análise:
```
🔍 ANÁLISE DE PERFORMANCE
├── 🎯 Problemas Críticos: [lista com localização exata]
├── ⚠️ Problemas Importantes: [lista com impacto]
├── 💡 Oportunidades: [melhorias sugeridas]
├── 📊 Métricas Estimadas: [LCP, FID, CLS previstos]
├── 🔧 Soluções Específicas: [código corrigido]
└── 📈 Impacto Esperado: [melhoria percentual estimada]
```

## 🎯 OBJETIVOS DE OTIMIZAÇÃO

### Metas Primárias:
- **Reduzir LCP** para < 2.5s em todas as páginas
- **Eliminar CLS** com dimensões adequadas
- **Otimizar TTFB** com cache inteligente
- **Reduzir bundle size** para < 300KB

### Metas Secundárias:
- **Implementar preloading** estratégico
- **Otimizar hidratação** do React
- **Melhorar cache** de dados Supabase
- **Reduzir JavaScript** não utilizado

### KPIs de Sucesso:
- **PageSpeed Score** > 90
- **Lighthouse Performance** > 95
- **Time to Interactive** < 3s
- **First Input Delay** < 50ms

---

## 🤖 INSTRUÇÕES PARA LLM

### Ao Analisar Código:
1. **Buscar todos os padrões** listados como "Problemas Críticos"
2. **Identificar localização exata** do problema (arquivo + linha)
3. **Propor solução específica** com código corrigido
4. **Estimar impacto** da correção na performance
5. **Priorizar correções** por impacto vs esforço
6. **Validar compatibilidade** com stack tecnológica atual

### Formato de Resposta:
Sempre incluir localização exata, problema identificado, solução proposta e impacto esperado na performance.