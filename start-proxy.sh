#!/bin/bash

echo "🔧 === INICIANDO CORS PROXY PARA N8N ==="
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Verificar se existe package.json
if [ ! -f "proxy-package.json" ]; then
    echo "❌ proxy-package.json não encontrado."
    exit 1
fi

echo "📦 Instalando dependências do proxy..."

# Instalar dependências usando o package.json do proxy
npm install --package-lock-only=false \
    express@^4.18.2 \
    cors@^2.8.5 \
    node-fetch@^2.6.7 \
    form-data@^4.0.0 \
    multer@^1.4.5-lts.1

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências."
    exit 1
fi

echo "✅ Dependências instaladas com sucesso!"
echo ""
echo "🚀 Iniciando CORS Proxy..."
echo "📍 Servidor: http://localhost:3001"
echo "🎯 Target: N8N Webhook"
echo ""
echo "⚠️  LEMBRE-SE: Este é um proxy TEMPORÁRIO"
echo "⚠️  Corrija o CORS no N8N e volte para URL original"
echo ""
echo "🛑 Para parar o proxy, pressione Ctrl+C"
echo ""

# Iniciar o proxy
node cors-proxy.js 