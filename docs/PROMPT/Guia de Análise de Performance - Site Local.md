# Guia de Análise de Performance - Site Local

## CONTEXTO DO PROBLEMA
- Site desenvolvido localmente (servidor local)
- Demora para carregar no Chrome (às vezes)
- Performance inconsistente
- Desenvolvedor iniciante precisa de diagnóstico preciso

## CHECKLIST DE ANÁLISE OBRIGATÓRIA

### 1. ANÁLISE DE RECURSOS E ASSETS
**Verificar:**
- [ ] Tamanho das imagens (verificar se são muito grandes)
- [ ] Formato das imagens (JPG/PNG vs WebP/AVIF)
- [ ] Número de arquivos CSS carregados
- [ ] Número de arquivos JavaScript carregados
- [ ] Fontes externas (Google Fonts, etc.)
- [ ] Bibliotecas/frameworks carregados

**Comandos para análise:**
```bash
# Verificar tamanho dos arquivos
ls -la assets/images/
ls -la css/
ls -la js/

# Contar arquivos por tipo
find . -name "*.jpg" -o -name "*.png" -o -name "*.gif" | wc -l
find . -name "*.css" | wc -l
find . -name "*.js" | wc -l
```

### 2. ANÁLISE DO SERVIDOR LOCAL
**Verificar qual servidor está sendo usado:**
- [ ] Live Server (VS Code)
- [ ] Python SimpleHTTPServer
- [ ] Node.js/Express
- [ ] XAMPP/WAMP
- [ ] Outro servidor local

**Problemas comuns por servidor:**
- **Live Server**: Pode ter limitações com muitos arquivos
- **Python SimpleHTTPServer**: Lento para múltiplas requisições
- **XAMPP**: Configuração de cache pode estar desabilitada

### 3. ANÁLISE DE CÓDIGO HTML
**Verificar estrutura:**
```html
<!-- VERIFICAR SE EXISTE: -->
<!-- 1. Muitos elementos DOM -->
<script>console.log('Total de elementos:', document.querySelectorAll('*').length)</script>

<!-- 2. Scripts bloqueantes no <head> -->
<!-- RUIM: -->
<head>
  <script src="script.js"></script>
</head>

<!-- BOM: -->
<head>
  <script src="script.js" defer></script>
</head>
<!-- OU no final do body -->

<!-- 3. CSS inline excessivo -->
<!-- 4. Imagens sem lazy loading -->
```

### 4. ANÁLISE DE JAVASCRIPT
**Verificar problemas comuns:**
```javascript
// 1. Loops infinitos ou pesados
for(let i = 0; i < 1000000; i++) {
  // Operação pesada
}

// 2. Event listeners excessivos
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handler); // Muitos listeners
});

// 3. Consultas DOM repetitivas
// RUIM:
for(let i = 0; i < 100; i++) {
  document.getElementById('elemento').innerHTML += 'texto';
}

// BOM:
let html = '';
for(let i = 0; i < 100; i++) {
  html += 'texto';
}
document.getElementById('elemento').innerHTML = html;

// 4. Fetch/Ajax sem otimização
fetch('/api/dados').then(response => {
  // Sem cache, sempre requisita
});
```

### 5. ANÁLISE DE CSS
**Verificar:**
```css
/* 1. Seletores complexos */
div > ul > li > a:hover .icon::before {
  /* Seletor muito específico = lento */
}

/* 2. Animações pesadas */
.elemento {
  transition: all 0.3s ease; /* 'all' é pesado */
  /* Melhor: */
  transition: transform 0.3s ease;
}

/* 3. Box-shadow/border-radius complexos */
.elemento {
  box-shadow: 0 0 50px rgba(0,0,0,0.5), 
              inset 0 0 50px rgba(255,255,255,0.1),
              0 0 100px rgba(0,0,0,0.3); /* Múltiplas sombras = lento */
}

/* 4. Gradientes complexos */
background: linear-gradient(45deg, #000, #111, #222, #333, #444); /* Muitas paradas */
```

## TESTES ESPECÍFICOS PARA EXECUTAR

### Teste 1: DevTools Performance
```javascript
// Cole no Console do Chrome:
console.time('Carregamento da página');
window.addEventListener('load', () => {
  console.timeEnd('Carregamento da página');
  console.log('Recursos carregados:', performance.getEntriesByType('resource').length);
  console.log('Tempo de DOM:', performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart, 'ms');
});
```

### Teste 2: Análise de Recursos
```javascript
// Cole no Console para ver recursos lentos:
performance.getEntriesByType('resource')
  .filter(resource => resource.duration > 100)
  .sort((a, b) => b.duration - a.duration)
  .forEach(resource => {
    console.log(`${resource.name}: ${resource.duration.toFixed(2)}ms`);
  });
```

### Teste 3: Verificar Servidor Local
```bash
# Se usando Python:
python -m http.server 8000 --bind 127.0.0.1

# Se usando Node.js:
npx http-server -p 8000 -a 127.0.0.1

# Testar com diferentes servidores para comparar performance
```

### Teste 4: Análise de Imagens
```javascript
// Cole no Console para verificar imagens grandes:
Array.from(document.images).forEach(img => {
  if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
    console.log(`Imagem grande: ${img.src} - ${img.naturalWidth}x${img.naturalHeight}`);
  }
});
```

## SOLUÇÕES PROVÁVEIS POR PROBLEMA

### Se o problema for IMAGENS:
```html
<!-- Otimizar imagens -->
<img src="imagem.jpg" 
     alt="Descrição" 
     loading="lazy"
     width="300" 
     height="200">

<!-- Usar formatos modernos -->
<picture>
  <source srcset="imagem.webp" type="image/webp">
  <img src="imagem.jpg" alt="Descrição">
</picture>
```

### Se o problema for JAVASCRIPT:
```javascript
// Usar defer/async
<script src="script.js" defer></script>

// Otimizar loops
const elemento = document.getElementById('elemento');
// Cache de elementos DOM
```

### Se o problema for CSS:
```css
/* Usar transform em vez de position */
.elemento {
  transform: translateX(100px); /* Melhor performance */
  /* Em vez de: left: 100px; */
}
```

### Se o problema for SERVIDOR:
```bash
# Trocar para servidor mais rápido
npm install -g http-server
http-server -p 8000 -c-1 --cors
```

## RELATÓRIO FINAL ESPERADO

Depois de executar todos os testes, forneça:

1. **Tempo de carregamento médio** (em ms)
2. **Recursos mais lentos** (top 5)
3. **Tamanho total dos assets** (MB)
4. **Número de requisições HTTP**
5. **Servidor local utilizado**
6. **Principais gargalos identificados**
7. **Soluções específicas recomendadas**

## PRÓXIMOS PASSOS APÓS ANÁLISE

1. Implementar soluções uma de cada vez
2. Testar performance após cada mudança
3. Documentar melhorias obtidas
4. Configurar servidor de desenvolvimento mais eficiente se necessário

---

**IMPORTANTE**: Execute todos os testes antes de propor soluções. Não assuma nada sem dados concretos.