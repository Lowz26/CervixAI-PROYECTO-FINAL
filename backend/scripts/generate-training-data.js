#!/usr/bin/env node

/**
 * Script para generar datos de entrenamiento
 * Crea un conjunto de datos sintético para entrenar el modelo
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TRAINING_DATA_FILE = path.join(DATA_DIR, 'training-data.json');

function generateTrainingData(count = 1000) {
  console.log('📊 Generando datos de entrenamiento...');
  console.log(`   Muestras a generar: ${count}`);

  const data = [];
  const positiveRate = 0.35; // 35% positivos, 65% negativos (más realista)

  for (let i = 0; i < count; i++) {
    const isPositive = Math.random() < positiveRate;
    const result = isPositive ? 'positivo' : 'negativo';

    // Genera características más realistas según el resultado
    const features = generateFeatures(isPositive);

    const sample = {
      id: i + 1,
      features: features,
      result: result,
      confidence: generateConfidence(isPositive),
      timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    data.push(sample);
  }

  return data;
}

function generateFeatures(isPositive) {
  const baseFeatures = {
    color: {
      red: Math.random(),
      green: Math.random(),
      blue: Math.random(),
    },
    texture: {
      smoothness: Math.random(),
      roughness: Math.random(),
      entropy: Math.random(),
    },
    shape: {
      circularity: Math.random(),
      compactness: Math.random(),
      eccentricity: Math.random(),
    },
    size: {
      width: Math.random() * 1000,
      height: Math.random() * 1000,
      area: Math.random() * 1000000,
    },
    contrast: Math.random(),
    brightness: Math.random(),
  };

  // Ajusta características basado en resultado esperado
  if (isPositive) {
    // Las muestras positivas tienden a tener mayor contraste y menores valores de suavidad
    baseFeatures.contrast = 0.6 + Math.random() * 0.4;
    baseFeatures.texture.smoothness = Math.random() * 0.4;
    baseFeatures.texture.entropy = 0.5 + Math.random() * 0.5;
  } else {
    // Las muestras negativas tienden a tener menor contraste
    baseFeatures.contrast = Math.random() * 0.5;
    baseFeatures.texture.smoothness = 0.5 + Math.random() * 0.5;
  }

  return baseFeatures;
}

function generateConfidence(isPositive) {
  // Genera confianzas más realistas
  if (isPositive) {
    // Positivos: distribución normal alrededor de 0.7
    return 0.6 + Math.random() * 0.35;
  } else {
    // Negativos: distribución normal alrededor de 0.3
    return Math.random() * 0.4;
  }
}

function saveTrainingData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(TRAINING_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Datos de entrenamiento guardados: ${TRAINING_DATA_FILE}`);
    console.log(`✓ Total de muestras: ${data.length}`);

    // Estadísticas
    const positives = data.filter((s) => s.result === 'positivo').length;
    const negatives = data.filter((s) => s.result === 'negativo').length;
    const avgConfidence = (data.reduce((sum, s) => sum + s.confidence, 0) / data.length).toFixed(3);

    console.log(`   Positivos: ${positives} (${((positives / data.length) * 100).toFixed(1)}%)`);
    console.log(`   Negativos: ${negatives} (${((negatives / data.length) * 100).toFixed(1)}%)`);
    console.log(`   Confianza promedio: ${avgConfidence}`);

    return true;
  } catch (error) {
    console.error('✗ Error guardando datos de entrenamiento:', error);
    return false;
  }
}

// Ejecuta el generador
if (require.main === module) {
  const sampleCount = parseInt(process.argv[2] || 1000);
  const trainingData = generateTrainingData(sampleCount);
  const success = saveTrainingData(trainingData);
  process.exit(success ? 0 : 1);
}

module.exports = { generateTrainingData, saveTrainingData };
