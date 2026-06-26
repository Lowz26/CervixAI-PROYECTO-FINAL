# CervixAI Backend v2.0

Backend completamente mejorado con persistencia de datos, SQLite, y modelo de IA entrenado.

## Características

✅ **SQLite Database** - Persistencia completa de datos  
✅ **JSON Backup** - Respaldo automático en formato JSON  
✅ **Modelo de IA** - Análisis inteligente con confianza realista  
✅ **Entrenador** - Scripts para entrenar el modelo  
✅ **Autenticación JWT** - Seguridad mejorada  
✅ **Estadísticas** - Métricas detalladas de análisis  

## Instalación

```bash
npm install
```

## Uso

### 1. Iniciar el Backend

```bash
npm start
```

El backend iniciará en `http://localhost:4000` e inicializará automáticamente:
- Base de datos SQLite
- Modelo de IA
- Archivos de datos

### 2. Generar Datos de Entrenamiento

```bash
npm run generate-data
```

Genera 1000 muestras sintéticas de entrenamiento con características realistas:
- Características de imagen (color, textura, forma, tamaño)
- Distribución 35% positivo, 65% negativo
- Confianzas variadas según resultado

```bash
npm run generate-data 5000  # Genera 5000 muestras
```

### 3. Entrenar el Modelo

```bash
npm run train
```

Entrena el modelo usando los datos generados:
- Calcula pesos características
- Genera métricas (accuracy, precision, recall, F1)
- Guarda modelo en `/models/model.json`

**Salida esperada:**
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

## Flujo de Datos

```
Frontend Angular
    ↓
API Express.js
    ↓
Autenticación JWT
    ├→ IA Analyzer (predice resultado)
    ├→ SQLite Database (guarda análisis)
    └→ JSON Persistence (sincroniza backup)
    ↓
Response al Frontend
```

## Endpoints Disponibles

### Autenticación
- `POST /api/login` - Login con usuario/contraseña
- `GET /api/user` - Obtiene datos del usuario autenticado

### Análisis
- `POST /api/analyze` - Realiza análisis usando el modelo de IA
- `GET /api/historial` - Obtiene historial de análisis
- `GET /api/historial/:id` - Obtiene un análisis específico
- `DELETE /api/historial/:id` - Elimina un análisis

### Dashboard
- `GET /api/dashboard` - Obtiene estadísticas del dashboard
- `GET /api/statistics` - Obtiene estadísticas detalladas
- `GET /api/info` - Obtiene información del sistema
- `GET /api/health` - Verifica estado del backend

## Estructura de Carpetas

```
backend/
├── index.js                 # Servidor principal
├── package.json
├── modules/
│   ├── database.js          # SQLite manager
│   ├── json-persistence.js  # JSON backup
│   └── ia-analyzer.js       # Modelo de IA
├── scripts/
│   ├── generate-training-data.js  # Generador de datos
│   └── train-model.js             # Script de entrenamiento
├── data/                    # Datos persistentes
│   ├── cervixai.db          # Base de datos SQLite
│   ├── analyses.json        # Backup de análisis
│   ├── trainings.json       # Información de entrenamientos
│   └── training-data.json   # Datos de entrenamiento
└── models/
    └── model.json           # Modelo entrenado
```

## Información de Análisis

Cada análisis contiene:
```json
{
  "id": 1,
  "imageName": "imagen-1234567890",
  "notes": "Notas del análisis",
  "result": "positivo|negativo",
  "confidence": 0.75,
  "modelVersion": "v1.0.0",
  "analyzedAt": "2024-06-26T10:30:00Z",
  "analyst": "Administrador"
}
```

## Variables de Entorno

```
PORT=4000                    # Puerto del servidor
JWT_SECRET=cervix-ai-secret  # Clave secreta para JWT
```

## Credenciales Predeterminadas

```
Username: admin
Password: admin123
```

## Sincronización de Datos

El backend mantiene sincronización automática entre:

1. **SQLite** - Base de datos principal (persistente)
2. **JSON** - Backup automático en cada operación
3. **Memoria** - Cache en tiempo de ejecución

Cuando guardes, elimines o modifiques análisis:
- Se guarda en SQLite
- Se sincroniza a JSON automáticamente
- Los datos persisten entre reinicios

## Modelo de IA

### Características Extraídas:
- Color (R, G, B)
- Textura (suavidad, rugosidad, entropía)
- Forma (circularidad, compactness, excentricidad)
- Tamaño (ancho, alto, área)
- Contraste
- Brillo

### Algoritmo:
- Clasificación binaria (positivo/negativo)
- Pesos basados en importancia de características
- Confianza normalizada [0.1, 0.9]
- Threshold de decisión: 0.5

### Mejora Continua:
```bash
# Generar más datos
npm run generate-data 10000

# Reentrenar modelo
npm run train

# El nuevo modelo reemplaza al anterior automáticamente
npm start
```

## Desarrollo

```bash
# Ver logs detallados
npm start

# Monitorear cambios
npx nodemon index.js

# Probar endpoints (usar Postman o curl)
curl -X GET http://localhost:4000/api/info
```

## Logs y Debugging

El servidor proporciona logs detallados:
```
✓ SQLite conectado: /backend/data/cervixai.db
✓ Modelo de IA cargado: v1.0.0
✓ Análisis cargados del JSON: 25
✓ Backend listo para recibir solicitudes
```

## Notas

- Los datos de la base de datos persisten entre reinicios
- El JSON se sincroniza automáticamente con cada cambio
- El modelo se carga al iniciar el servidor
- Para mejor rendimiento, reentrenar con 5000+ muestras

## Próximas Mejoras

- [ ] Procesamiento real de imágenes con TensorFlow.js
- [ ] Validación de imágenes mejorada
- [ ] API de carga de imágenes
- [ ] Métricas en tiempo real
- [ ] Dashboard de entrenamiento
- [ ] Exportación de reportes

---

**Versión**: 2.0.0  
**Última actualización**: 2024-06-26
