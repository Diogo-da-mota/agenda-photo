#!/usr/bin/env powershell

Write-Host "🔧 === INICIANDO CORS PROXY PARA N8N ===" -ForegroundColor Yellow
Write-Host ""

# Verificar se Node.js está instalado
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green

# Verificar se npm está instalado
$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    Write-Host "❌ npm não encontrado. Instale npm primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green

# Verificar se existe cors-proxy.js
if (-not (Test-Path "cors-proxy.js")) {
    Write-Host "❌ cors-proxy.js não encontrado." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Instalando dependências do proxy..." -ForegroundColor Blue

# Instalar dependências
$packages = @(
    "express@^4.18.2",
    "cors@^2.8.5", 
    "node-fetch@^2.6.7",
    "form-data@^4.0.0",
    "multer@^1.4.5-lts.1"
)

foreach ($package in $packages) {
    Write-Host "📦 Instalando $package..." -ForegroundColor Cyan
    npm install $package --no-package-lock
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar $package." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Iniciando CORS Proxy..." -ForegroundColor Yellow
Write-Host "📍 Servidor: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🎯 Target: N8N Webhook" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  LEMBRE-SE: Este é um proxy TEMPORÁRIO" -ForegroundColor Yellow
Write-Host "⚠️  Corrija o CORS no N8N e volte para URL original" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 Para parar o proxy, pressione Ctrl+C" -ForegroundColor Magenta
Write-Host ""

# Iniciar o proxy
node cors-proxy.js 