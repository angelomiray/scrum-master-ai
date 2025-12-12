#!/bin/bash

# Script para iniciar o backend do Scrum Master AI

cd "$(dirname "$0")"

echo "🚀 Iniciando Backend FastAPI..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ativa o ambiente virtual
source venv/bin/activate

# Inicia o servidor
echo "✅ Servidor rodando em http://localhost:8000"
echo "📚 API Docs em http://localhost:8000/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python main.py
