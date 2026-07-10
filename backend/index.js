const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const upload = multer(); // Usar memoria para proxy a FastAPI

// Importa módulos de persistencia
const database = require('./modules/database');
const jsonPersistence = require('./modules/json-persistence');
const iaAnalyzer = require('./modules/ia-analyzer');

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || 'cervix-ai-secret';

app.use(cors());
app.use(express.json());

// ============================================================
// INICIALIZACIÓN DEL BACKEND
// ============================================================

let isReady = false;

async function initializeBackend() {
  try {
    console.log('\n🚀 Inicializando CervixAI Backend...\n');

    // Inicializa SQLite
    await database.initialize();

    // Carga el modelo de IA
    await iaAnalyzer.loadModel();

    // Carga datos JSON si existen (para sincronización)
    const savedAnalyses = jsonPersistence.loadAnalyses();
    console.log(`✓ Análisis cargados del JSON: ${savedAnalyses.length}`);

    isReady = true;
    console.log('✓ Backend listo para recibir solicitudes\n');
  } catch (error) {
    console.error('✗ Error inicializando backend:', error);
    process.exit(1);
  }
}

// Middleware para verificar que el backend está listo
app.use((req, res, next) => {
  if (!isReady && req.path !== '/api/health') {
    return res.status(503).json({ message: 'Backend inicializando...' });
  }
  next();
});

// ============================================================
// AUTENTICACIÓN
// ============================================================

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}

// ============================================================
// ENDPOINTS DE SALUD Y INFO
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: isReady ? 'ready' : 'initializing',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    version: '2.0.0',
    backend: 'Express.js',
    database: 'SQLite',
    persistence: 'JSON',
    aiModel: iaAnalyzer.getModelInfo(),
    persistence: {
      ...jsonPersistence.getFileInfo(),
    },
  });
});

// ============================================================
// AUTENTICACIÓN Y USUARIO
// ============================================================

app.post('/api/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Usuario requerido' });
    }

    // Modo desarrollo: no valida contraseña
    const token = jwt.sign(
      { id: 1, username: username, name: username },
      jwtSecret,
      { expiresIn: '4h' }
    );

    res.json({
      token,
      user: { id: 1, username: username, name: username },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en servidor' });
  }
});

app.get('/api/user', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    name: req.user.name,
  });
});

// ============================================================
// DASHBOARD
// ============================================================

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = await database.getStats();
    const analyses = await database.getAnalyses();
    const lastAnalysis = analyses[0] || null;
    const modelInfo = iaAnalyzer.getModelInfo();

    const summary = {
      totalAnalyses: stats.totalAnalyses,
      positiveCount: stats.positiveCount,
      negativeCount: stats.negativeCount,
      avgConfidence: stats.avgConfidence,
      lastAnalysis,
    };

    res.json({
      summary,
      modelInfo,
      recommendations: '✓ Datos persistentes en SQLite y JSON',
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ message: 'Error obteniendo dashboard' });
  }
});

// ============================================================
// ANÁLISIS
// ============================================================

app.post('/api/analyze', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No se envió ninguna imagen' });
    }

    // Proxy a FastAPI
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);

    const apiResponse = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData,
    });

    if (!apiResponse.ok) {
      throw new Error(`Error en el modelo de IA: ${apiResponse.statusText}`);
    }

    const prediction = await apiResponse.json();
    
    // Mapear resultado a 'normal' o 'positivo'
    const predStr = String(prediction.prediction).toLowerCase();
    const mappedResult = predStr.includes('normal') ? 'normal' : 'positivo';

    // Guarda en base de datos
    const analysis = await database.insertAnalysis({
      imageName: file.originalname,
      notes: req.body.imageNotes || 'Análisis por IA',
      result: mappedResult,
      confidence: prediction.confidence,
      modelVersion: 'MobileViT',
      analyst: req.user.name,
    });

    // Sincroniza con JSON
    const allAnalyses = await database.getAnalyses();
    jsonPersistence.saveAnalyses(allAnalyses);

    res.json({
      message: 'Análisis completado con el modelo de IA',
      report: analysis,
      prediction: {
        confidence: prediction.confidence,
        modelVersion: 'MobileViT',
      },
    });
  } catch (error) {
    console.error('Error en análisis:', error);
    res.status(500).json({ message: 'Error realizando análisis con la IA' });
  }
});

// ============================================================
// HISTORIAL
// ============================================================

app.get('/api/historial', authenticateToken, async (req, res) => {
  try {
    const items = await database.getAnalyses();
    res.json({ items });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ message: 'Error obteniendo historial' });
  }
});

app.get('/api/historial/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await database.getAnalysis(id);

    if (!item) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error obteniendo análisis:', error);
    res.status(500).json({ message: 'Error obteniendo análisis' });
  }
});

app.delete('/api/historial/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await database.getAnalysis(id);

    if (!item) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await database.deleteAnalysis(id);

    // Sincroniza con JSON
    const allAnalyses = await database.getAnalyses();
    jsonPersistence.saveAnalyses(allAnalyses);

    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    console.error('Error eliminando análisis:', error);
    res.status(500).json({ message: 'Error eliminando análisis' });
  }
});

// ============================================================
// ESTADÍSTICAS Y EXPORTACIÓN
// ============================================================

app.get('/api/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = await database.getStats();
    const training = await database.getLatestTraining();

    res.json({
      analyses: stats,
      model: {
        version: training?.modelVersion,
        accuracy: training?.accuracy,
        trainingDate: training?.trainingDate,
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
});

// ============================================================
// MANEJO DE ERRORES
// ============================================================

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// ============================================================
// SERVIDOR
// ============================================================

// Maneja cierre gracioso del servidor
process.on('SIGTERM', async () => {
  console.log('\n📴 Cerrando servidor...');
  await database.close();
  process.exit(0);
});

// Inicia el servidor
async function start() {
  await initializeBackend();

  server = app.listen(port, () => {
    console.log(`\n✓ Backend escuchando en http://localhost:${port}`);
    console.log(`✓ Endpoints disponibles:`);
    console.log(`   - POST   /api/login`);
    console.log(`   - GET    /api/dashboard`);
    console.log(`   - POST   /api/analyze`);
    console.log(`   - GET    /api/historial`);
    console.log(`   - GET    /api/statistics`);
    console.log(`   - GET    /api/info\n`);
  });
}

start().catch((error) => {
  console.error('✗ Error iniciando servidor:', error);
  process.exit(1);
});
