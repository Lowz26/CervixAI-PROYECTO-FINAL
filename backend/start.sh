#!/bin/bash
# Entrar al directorio del backend
cd backend

# Iniciar servidor de Inteligencia Artificial (FastAPI) en segundo plano
echo "Iniciando FastAPI..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &

# Esperar 2 segundos para dar tiempo al modelo a cargar en memoria
sleep 2

# Iniciar servidor web Node.js en primer plano
echo "Iniciando Node.js..."
npm start
