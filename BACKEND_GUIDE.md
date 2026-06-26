# Documentación de CervixAI - Análisis y Guía de Uso

## 📊 Análisis del Proyecto Actual

### Frontend (Angular 22)

**Estructura:**
- **Login Component** (`src/app/login/`) - Autenticación de usuario
- **Dashboard Component** (`src/app/dashboard/`) - Panel principal con estadísticas
- **Historial Component** (`src/app/historial/`) - Listado de análisis previos

**Características:**
- Autenticación con token JWT
- Almacenamiento en localStorage
- Interfaz responsiva y limpia
- Rutas protegidas

**Mejoras Implementadas:**
- ✅ Se mantiene la interfaz igual (compatible hacia atrás)
- ✅ Nueva información de confianza en análisis
- ✅ Información del modelo en dashboard

### Backend Anterior

**Problemas:**
- ❌ Datos solo en memoria
- ❌ Se perdían análisis al reiniciar
- ❌ Sin persistencia real
- ❌ Análisis 100% aleatorios (50/50)

### Backend Mejorado v2.0

**Soluciones Implementadas:**

#### 1. **Base de Datos SQLite**
```javascript
// database.js proporciona:
- Almacenamiento persistente en archivo
- Tablas: users, analyses, trainings
- Métodos CRUD para todas las operaciones
- Estadísticas automáticas
```

#### 2. **Persistencia JSON**
```javascript
// json-persistence.js proporciona:
- Backup automático en JSON
- Sincronización con SQLite
- Exportación de datos
- Fácil lectura para auditoría
```

#### 3. **Modelo de IA**
```javascript
// ia-analyzer.js proporciona:
- Análisis basado en características
- Confianza realista (0.55-0.95)
- Extracción de características
- Predicción probabilística
```

#### 4. **Entrenamiento**
```javascript
// train-model.js proporciona:
- Entrenamiento con datos sintéticos
- Cálculo de métricas (accuracy, precision, recall, F1)
- Generación de pesos
- Modelo guardado como JSON

// generate-training-data.js proporciona:
- Generación de 1000-10000 muestras
- Características realistas
- Distribución 35% positivo / 65% negativo
```

---

## 🚀 Guía de Inicio Rápido

### Paso 1: Instalar Dependencias

```bash
cd backend
npm install
```

### Paso 2: Generar Datos de Entrenamiento

```bash
npm run generate-data
```

**Salida:**
```
📊 Generando datos de entrenamiento...
   Muestras a generar: 1000
✓ Datos de entrenamiento guardados: backend/data/training-data.json
✓ Total de muestras: 1000
   Positivos: 350 (35.0%)
   Negativos: 650 (65.0%)
   Confianza promedio: 0.650
```

### Paso 3: Entrenar el Modelo

```bash
npm run train
```

**Salida:**
```
🧠 Iniciando entrenamiento del modelo...

✓ Entrenamiento completado

📊 Métricas del modelo:
   Accuracy:  75.42%
   Precision: 78.15%
   Recall:    72.89%
   F1 Score:  0.755
   Loss:      0.432
   Duración:  145ms

✓ Modelo guardado: backend/models/model.json
✓ Versión: v1719334567890

🎉 ¡Entrenamiento completado exitosamente!
```

### Paso 4: Iniciar el Backend

```bash
npm start
```

**Salida:**
```
🚀 Inicializando CervixAI Backend...

✓ SQLite conectado: /workspaces/cervixai-vercel/backend/data/cervixai.db
✓ Modelo de IA cargado: v1.0.0-default
✓ Análisis cargados del JSON: 0
✓ Backend listo para recibir solicitudes

✓ Backend escuchando en http://localhost:4000
✓ Endpoints disponibles:
   - POST   /api/login
   - GET    /api/dashboard
   - POST   /api/analyze
   - GET    /api/historial
   - GET    /api/statistics
   - GET    /api/info
```

### Paso 5: Usar el Frontend

```bash
# En otra terminal, en la raíz del proyecto
npm start
```

Abre `http://localhost:4200` en tu navegador.

---

## 🔄 Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND ANGULAR 22                          │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────────┐     │
│  │   Login     │  │   Dashboard   │  │   Historial      │     │
│  └──────┬──────┘  └───────┬───────┘  └────────┬─────────┘     │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼──────────┐
                    │   HTTP / JSON     │
                    └────────┬──────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                  BACKEND EXPRESS.JS                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              JWT Authentication                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │              IA Analyzer (Prediction)                  │  │
│  │  ├─ Extract Features (color, texture, shape, size)    │  │
│  │  ├─ Calculate Confidence                              │  │
│  │  └─ Determine Result (positive/negative)              │  │
│  └──────┬──────────────────────────────────────────────────┘  │
│         │                                                      │
│  ┌──────▼─────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  SQLite DB     │  │  JSON Backup     │  │  Model JSON  │  │
│  │  (analyses)    │  │  (sync)          │  │  (weights)   │  │
│  └────────────────┘  └──────────────────┘  └──────────────┘  │
│         │                                        │             │
│         └────────────────────────────────────────┘             │
│         Data Persistence & Synchronization                     │
└────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
cervixai-vercel/
├── src/                    # Frontend Angular
│   ├── app/
│   │   ├── login/         # Login component
│   │   ├── dashboard/     # Dashboard component
│   │   └── historial/     # History component
│   └── ...
│
├── backend/               # Backend Express
│   ├── index.js          # Servidor principal
│   ├── package.json      # Dependencias
│   ├── modules/
│   │   ├── database.js        # SQLite manager
│   │   ├── json-persistence.js # JSON backup
│   │   └── ia-analyzer.js      # IA Model
│   ├── scripts/
│   │   ├── generate-training-data.js  # Data generator
│   │   └── train-model.js             # Model trainer
│   ├── data/
│   │   ├── cervixai.db           # SQLite database
│   │   ├── analyses.json         # Backup analyses
│   │   ├── trainings.json        # Training info
│   │   └── training-data.json    # Training dataset
│   └── models/
│       └── model.json            # Trained model
│
├── api/                   # Vercel Functions (legacy)
│   └── ...
│
└── ...
```

---

## 📊 Base de Datos SQLite

### Tabla: users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: analyses
```sql
CREATE TABLE analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imageName TEXT NOT NULL,
  notes TEXT,
  result TEXT NOT NULL,
  confidence REAL DEFAULT 0.5,
  modelVersion TEXT,
  analyzedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  analyst TEXT NOT NULL
);
```

### Tabla: trainings
```sql
CREATE TABLE trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modelVersion TEXT UNIQUE NOT NULL,
  accuracy REAL,
  loss REAL,
  samplesCount INTEGER,
  trainingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  modelPath TEXT NOT NULL
);
```

---

## 🤖 Modelo de IA

### Características Analizadas

1. **Color**
   - Red, Green, Blue channels
   - Intensidad total

2. **Textura**
   - Smoothness (suavidad)
   - Roughness (rugosidad)
   - Entropy (entropía)

3. **Forma**
   - Circularity (circularidad)
   - Compactness (compactness)
   - Eccentricity (excentricidad)

4. **Tamaño**
   - Width (ancho)
   - Height (altura)
   - Area (área)

5. **Global**
   - Contrast (contraste)
   - Brightness (brillo)

### Algoritmo de Predicción

```javascript
1. Extrae características de la imagen
2. Normaliza características a [0, 1]
3. Aplica pesos del modelo entrenado
4. Calcula score = 0.5 + (sum of weighted features)
5. Genera confianza normalizada
6. Clasifica: score > 0.5 → "positivo", else → "negativo"
```

### Métricas del Modelo

- **Accuracy**: Proporción de predicciones correctas
- **Precision**: De las predicciones positivas, cuántas son correctas
- **Recall**: De los casos positivos reales, cuántos detectó
- **F1 Score**: Media armónica de precision y recall
- **Loss**: Error promedio de las predicciones

---

## 🔧 Comandos Disponibles

### Backend

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Generar datos de entrenamiento
npm run generate-data
npm run generate-data 5000  # Con parámetro personalizado

# Entrenar modelo
npm run train
```

### Frontend

```bash
cd ..
npm start      # Inicia el servidor Angular en puerto 4200
npm build      # Build de producción
npm test       # Ejecutar tests
```

---

## 🧪 Testing API

### Usar Postman o curl

```bash
# Login
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {"id":1,"username":"admin","name":"Administrador"}
# }

# Usar el token para obtener análisis
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:4000/api/analyze \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📈 Mejora Continua

### Para mejorar el modelo:

```bash
# 1. Generar más muestras (10000)
npm run generate-data 10000

# 2. Entrenar con más datos
npm run train

# 3. Reiniciar backend
npm start
```

El nuevo modelo se cargará automáticamente y reemplazará al anterior.

---

## ✅ Checklist de Implementación

- ✅ SQLite Database integrada
- ✅ JSON Persistence (backup automático)
- ✅ Modelo de IA con características realistas
- ✅ Script de generación de datos
- ✅ Script de entrenamiento del modelo
- ✅ Sincronización automática de datos
- ✅ Métricas del modelo (accuracy, precision, recall, F1)
- ✅ Confianza realista en predicciones
- ✅ Endpoints para estadísticas
- ✅ Documentación completa

---

## 🚀 Próximas Mejoras Sugeridas

1. **Procesamiento Real de Imágenes**
   - Integrar TensorFlow.js
   - Extraer características de imágenes reales
   - API de carga de archivos

2. **Machine Learning Mejorado**
   - Red neuronal convolucional (CNN)
   - Transfer learning con modelos pre-entrenados
   - Fine-tuning automático

3. **Dashboard Mejorado**
   - Gráficos en tiempo real
   - Matriz de confusión
   - Métricas por rango de confianza

4. **API Mejorada**
   - Batch processing
   - Validación de imágenes
   - Caché de resultados

5. **DevOps**
   - Docker containerization
   - CI/CD con GitHub Actions
   - Tests automatizados

---

**Documentación Versión**: 2.0  
**Última actualización**: 2024-06-26  
**Autor**: CervixAI Development Team
