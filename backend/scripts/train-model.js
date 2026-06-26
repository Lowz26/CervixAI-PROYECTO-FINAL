#!/usr/bin/env node

/**
 * Script para entrenar el modelo de IA
 * Utiliza los datos generados para entrenar y generar el modelo
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TRAINING_DATA_FILE = path.join(DATA_DIR, 'training-data.json');
const MODEL_DIR = path.join(__dirname, '../models');
const MODEL_FILE = path.join(MODEL_DIR, 'model.json');

class ModelTrainer {
  constructor() {
    this.trainingData = [];
    this.model = null;
    this.version = `v${Date.now()}`;
  }

  /**
   * Carga los datos de entrenamiento
   */
  loadTrainingData() {
    try {
      if (!fs.existsSync(TRAINING_DATA_FILE)) {
        console.error(
          '✗ Archivo de entrenamiento no encontrado. Ejecute: npm run generate-data'
        );
        return false;
      }

      const data = JSON.parse(fs.readFileSync(TRAINING_DATA_FILE, 'utf-8'));
      this.trainingData = data;
      console.log(`✓ Datos de entrenamiento cargados: ${data.length} muestras`);
      return true;
    } catch (error) {
      console.error('✗ Error cargando datos de entrenamiento:', error);
      return false;
    }
  }

  /**
   * Entrena el modelo simple
   */
  train() {
    console.log('\n🧠 Iniciando entrenamiento del modelo...\n');

    if (this.trainingData.length === 0) {
      console.error('✗ No hay datos para entrenar');
      return false;
    }

    const startTime = Date.now();

    // Extrae pesos característicos
    const weights = this.calculateWeights();

    // Calcula métricas
    const metrics = this.calculateMetrics(weights);

    this.model = {
      version: this.version,
      type: 'binary-classification',
      createdAt: new Date().toISOString(),
      trainingDuration: Date.now() - startTime,
      samplesCount: this.trainingData.length,
      accuracy: metrics.accuracy,
      precision: metrics.precision,
      recall: metrics.recall,
      f1Score: metrics.f1Score,
      loss: metrics.loss,
      weights: weights,
      threshold: 0.5,
      features: ['color', 'texture', 'shape', 'size', 'contrast', 'brightness'],
      metadata: {
        positiveCount: this.trainingData.filter((s) => s.result === 'positivo').length,
        negativeCount: this.trainingData.filter((s) => s.result === 'negativo').length,
        avgConfidence: (
          this.trainingData.reduce((sum, s) => sum + s.confidence, 0) / this.trainingData.length
        ).toFixed(3),
      },
    };

    console.log('✓ Entrenamiento completado');
    console.log(`\n📊 Métricas del modelo:`);
    console.log(`   Accuracy:  ${(metrics.accuracy * 100).toFixed(2)}%`);
    console.log(`   Precision: ${(metrics.precision * 100).toFixed(2)}%`);
    console.log(`   Recall:    ${(metrics.recall * 100).toFixed(2)}%`);
    console.log(`   F1 Score:  ${metrics.f1Score.toFixed(3)}`);
    console.log(`   Loss:      ${metrics.loss.toFixed(3)}`);
    console.log(`   Duración:  ${this.model.trainingDuration}ms`);

    return true;
  }

  /**
   * Calcula pesos basados en el análisis de datos
   */
  calculateWeights() {
    const weights = {};

    // Análisis de importancia de características
    const positives = this.trainingData.filter((s) => s.result === 'positivo');
    const negatives = this.trainingData.filter((s) => s.result === 'negativo');

    // Calcula diferencias promedio en características
    weights.contrast_weight = this.calculateFeatureImportance(
      positives,
      negatives,
      'contrast'
    );
    weights.color_weight = this.calculateFeatureImportance(
      positives,
      negatives,
      'color'
    );
    weights.texture_weight = this.calculateFeatureImportance(
      positives,
      negatives,
      'texture'
    );
    weights.shape_weight = this.calculateFeatureImportance(positives, negatives, 'shape');
    weights.size_weight = this.calculateFeatureImportance(positives, negatives, 'size');

    return weights;
  }

  /**
   * Calcula importancia de característica
   */
  calculateFeatureImportance(positives, negatives, feature) {
    const posAvg = positives.reduce((sum, s) => {
      if (typeof s.features[feature] === 'number') return sum + s.features[feature];
      if (typeof s.features[feature] === 'object') {
        return sum + Object.values(s.features[feature]).reduce((a, b) => a + b, 0);
      }
      return sum;
    }, 0) / Math.max(positives.length, 1);

    const negAvg = negatives.reduce((sum, s) => {
      if (typeof s.features[feature] === 'number') return sum + s.features[feature];
      if (typeof s.features[feature] === 'object') {
        return sum + Object.values(s.features[feature]).reduce((a, b) => a + b, 0);
      }
      return sum;
    }, 0) / Math.max(negatives.length, 1);

    return Math.abs(posAvg - negAvg);
  }

  /**
   * Calcula métricas del modelo
   */
  calculateMetrics(weights) {
    let correctPredictions = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let losses = [];

    for (const sample of this.trainingData) {
      const predicted = this.predictSample(sample, weights);
      const actual = sample.result === 'positivo' ? 1 : 0;

      // Calcula loss
      const loss = -actual * Math.log(predicted + 0.001) -
        (1 - actual) * Math.log(1 - predicted + 0.001);
      losses.push(loss);

      // Determina si la predicción es correcta
      const predictedClass = predicted > 0.5 ? 'positivo' : 'negativo';
      if (predictedClass === sample.result) {
        correctPredictions++;
      }

      // Calcula TP, FP, FN
      if (predictedClass === 'positivo' && sample.result === 'positivo') {
        truePositives++;
      } else if (predictedClass === 'positivo' && sample.result === 'negativo') {
        falsePositives++;
      } else if (predictedClass === 'negativo' && sample.result === 'positivo') {
        falseNegatives++;
      }
    }

    const accuracy = correctPredictions / this.trainingData.length;
    const precision = truePositives / Math.max(truePositives + falsePositives, 1);
    const recall = truePositives / Math.max(truePositives + falseNegatives, 1);
    const f1Score = 2 * (precision * recall) / (precision + recall || 1);
    const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      loss: avgLoss,
    };
  }

  /**
   * Predice resultado para una muestra
   */
  predictSample(sample, weights) {
    let score = 0.5; // Base

    const features = sample.features;

    // Aplica pesos a características
    if (features.contrast !== undefined) {
      score += (features.contrast - 0.5) * weights.contrast_weight * 0.2;
    }

    if (features.texture && features.texture.entropy !== undefined) {
      score += (features.texture.entropy - 0.5) * weights.texture_weight * 0.15;
    }

    if (features.color && features.color.red !== undefined) {
      const colorIntensity = features.color.red + features.color.green + features.color.blue;
      score += (colorIntensity / 3 - 0.5) * weights.color_weight * 0.1;
    }

    // Asegura que esté en rango [0, 1]
    return Math.max(0.01, Math.min(0.99, score));
  }

  /**
   * Guarda el modelo
   */
  saveModel() {
    try {
      if (!fs.existsSync(MODEL_DIR)) {
        fs.mkdirSync(MODEL_DIR, { recursive: true });
      }

      fs.writeFileSync(MODEL_FILE, JSON.stringify(this.model, null, 2), 'utf-8');
      console.log(`\n✓ Modelo guardado: ${MODEL_FILE}`);
      console.log(`✓ Versión: ${this.model.version}`);
      return true;
    } catch (error) {
      console.error('✗ Error guardando modelo:', error);
      return false;
    }
  }
}

// Ejecuta el entrenador
if (require.main === module) {
  const trainer = new ModelTrainer();

  if (!trainer.loadTrainingData()) {
    process.exit(1);
  }

  if (!trainer.train()) {
    process.exit(1);
  }

  if (!trainer.saveModel()) {
    process.exit(1);
  }

  console.log('\n🎉 ¡Entrenamiento completado exitosamente!\n');
  process.exit(0);
}

module.exports = ModelTrainer;
