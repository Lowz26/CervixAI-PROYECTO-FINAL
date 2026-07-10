# Usa Python 3.11 como base
FROM python:3.11-slim

# Evita que Python genere archivos .pyc
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instala dependencias del sistema y Node.js 18
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependencias de Python
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Instala dependencias de Node
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copia todo el código fuente del backend
COPY backend/ ./backend/

# Permisos para el script de inicio
RUN chmod +x backend/start.sh

# Render expone la variable PORT, Node se conecta a ella.
EXPOSE 4000

# Comando para iniciar
CMD ["./backend/start.sh"]
