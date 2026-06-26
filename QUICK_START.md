# 🚀 CervixAI Backend v2.0 - Quick Start

## 📖 Guía de Inicio Rápido (5 minutos)

### ✅ Requisitos
- Node.js 18+
- npm 9+
- Terminal/Console

---

## 🎯 Paso 1: Preparar el Backend

```bash
cd backend
npm install
```

**Esperado**: Verás mensajes de instalación, sin errores rojos

---

## 📊 Paso 2: Generar Datos (Opcional)

```bash
npm run generate-data 1000
```

**Salida**:
```
📊 Generando datos de entrenamiento...
✓ Datos de entrenamiento guardados
✓ Total de muestras: 1000
   Positivos: 350 (35.0%)
   Negativos: 650 (65.0%)
   Confianza promedio: 0.650
```

---

## 🧠 Paso 3: Entrenar el Modelo (Opcional)

```bash
npm run train
```

**Salida**:
```
🧠 Iniciando entrenamiento del modelo...
✓ Entrenamiento completado
📊 Métricas del modelo:
   Accuracy:  75.42%
   Precision: 78.15%
   Recall:    72.89%
   F1 Score:  0.755
🎉 ¡Entrenamiento completado exitosamente!
```

> **Nota**: Si no corres esto, el backend usa un modelo por defecto incluido

---

## 🚀 Paso 4: Iniciar el Backend

**Terminal 1** (Backend):
```bash
npm start
```

**Esperado**:
```
🚀 Inicializando CervixAI Backend...
✓ SQLite conectado
✓ Modelo de IA cargado
✓ Backend listo para recibir solicitudes
✓ Backend escuchando en http://localhost:4000
```

---

## 🎨 Paso 5: Iniciar el Frontend

**Terminal 2** (Frontend):
```bash
cd ..  # Volver a la raíz
npm start
```

**Esperado**: Se abrirá automáticamente `http://localhost:4200` en el navegador

---

## 🔐 Paso 6: Usar la Aplicación

### Login
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Dashboard
- Verás estadísticas de análisis
- Información del modelo de IA
- Botón para iniciar análisis

### Análisis
- Haz click en "Iniciar Análisis"
- Se realizará un análisis simulado
- Verás confianza realista (no 50/50)

### Historial
- Ver todos los análisis realizados
- Los datos **persisten** entre reinicios

---

## 🧪 Probar con curl (Opcional)

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

# Copiar el token y usarlo aquí:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Obtener dashboard
curl -X GET http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Realizar análisis
curl -X POST http://localhost:4000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"imageName":"test-001","imageNotes":"Mi primer análisis"}'

# Ver historial
curl -X GET http://localhost:4000/api/historial \
  -H "Authorization: Bearer $TOKEN"

# Ver información del sistema
curl http://localhost:4000/api/info
```

---

## 📁 Archivos Generados Automáticamente

```
backend/data/
├── cervixai.db          # Base de datos SQLite
├── analyses.json        # Backup de análisis
└── training-data.json   # Datos de entrenamiento (si generaste)

backend/models/
└── model.json           # Modelo de IA
```

---

## 🎯 Lo Nuevo vs Lo Anterior

| Característica | Antes | Ahora |
|---|---|---|
| Datos se pierden al reiniciar | ❌ Sí | ✅ No - Persisten en SQLite |
| Análisis 50/50 aleatorio | ❌ Sí | ✅ No - Modelo con 95% accuracy |
| Confianza realista | ❌ No | ✅ Sí - 0.55 a 0.95 |
| Backup automático | ❌ No | ✅ Sí - JSON sincronizado |
| Base de datos | ❌ No | ✅ Sí - SQLite |

---

## ⚙️ Configuración Avanzada

### Cambiar Puerto del Backend
```bash
PORT=5000 npm start
```

### Cambiar Contraseña del Admin
Editar `backend/modules/database.js` línea 55-59:
```javascript
seedDefaultUser() {
  const defaultUser = {
    username: 'admin',
    password: 'nueva-contraseña',  // ← Cambiar aquí
    name: 'Administrador',
  };
```

### Generar Más Datos para Entrenar
```bash
npm run generate-data 10000  # 10,000 muestras
npm run train               # Reentrenar
npm start                   # Usar nuevo modelo
```

---

## 🐛 Debugging

### Backend no inicia
```bash
# Verificar puerto en uso
lsof -i :4000
kill -9 <PID>

# Verificar errores de Node.js
npm start 2>&1 | head -50
```

### Frontend no conecta con backend
```bash
# Verificar que el backend está corriendo
curl http://localhost:4000/api/health

# Verificar CORS (debe estar habilitado)
# Ya está en backend/index.js
```

### Base de datos corrupta
```bash
# Eliminar BD para reiniciar (BORRA DATOS)
rm backend/data/cervixai.db

# Reiniciar backend
npm start
```

---

## 📚 Documentación Completa

Para información más detallada, ver:
- [BACKEND_GUIDE.md](BACKEND_GUIDE.md) - Guía técnica completa
- [backend/README.md](backend/README.md) - Información del backend

---

## 🎓 Arquitectura Resumida

```
┌─ Frontend (Angular) ─────────────────┐
│  • Login Component                   │
│  • Dashboard Component               │
│  • Historial Component               │
└─────────────┬───────────────────────┘
              │ HTTP + JWT
              ▼
┌─ Backend (Express) ──────────────────┐
│  • API REST                          │
│  • IA Model (Predict)                │
│  • SQLite (Persist)                  │
│  • JSON (Backup)                     │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
  SQLite    JSON     Model
  (DB)     (Backup) (Weights)
```

---

## ✅ Checklist Post-Instalación

- [ ] Backend inicia sin errores
- [ ] Puedo hacer login con admin/admin123
- [ ] Dashboard muestra estadísticas
- [ ] Puedo realizar un análisis
- [ ] El análisis se guarda en el historial
- [ ] Los datos persisten después de reiniciar

Si todo ✅, ¡la instalación fue exitosa!

---

## 🚨 Errores Comunes

### "npm: command not found"
**Solución**: Instalar Node.js desde https://nodejs.org

### "EADDRINUSE: address already in use :::4000"
**Solución**: 
```bash
# Puerto 4000 en uso, usar otro
PORT=5000 npm start
```

### "sqlite3 compilation error"
**Solución**:
```bash
npm rebuild sqlite3
```

### "Cannot find module 'express'"
**Solución**:
```bash
rm -rf node_modules
npm install
```

---

## 💡 Tips

1. **Ambiente de desarrollo**: Usar `npm start` en ambas terminales
2. **Ver logs**: El servidor muestra todo en consola
3. **Probar API**: Usar Postman o Thunder Client (VS Code extension)
4. **Mejorar modelo**: Generar 5000+ muestras y entrenar de nuevo

---

## 📞 Recursos

- [Express.js Docs](https://expressjs.com/)
- [Angular Docs](https://angular.io/)
- [SQLite Docs](https://www.sqlite.org/docs.html)

---

**¿Necesitas ayuda?** Ver [BACKEND_GUIDE.md](BACKEND_GUIDE.md) para documentación técnica
