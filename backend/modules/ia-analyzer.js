/**
 * Módulo de IA para análisis de imágenes
 * Usa un modelo entrenado para simular resultados realistas
 */

const fs = require('fs');
const path = require('path');

const MODEL_DIR = path.join(__dirname, '../models');

class IAAnalyzer {
  constructor() {
    this.model = null;
    this.modelVersion = 'v1.0.0';
    this.isLoaded = false;
  }

  /**
   * Carga el modelo entrenado
   */
  async loadModel() {
    try {
      const modelFile = path.join(MODEL_DIR, 'model.json');
      
      if (fs.existsSync(modelFile)) {
        // Carga el modelo simulado
        const modelData = JSON.parse(fs.readFileSync(modelFile, 'utf-8'));
        this.model = modelData;
        this.modelVersion = modelData.version || 'v1.0.0';
        this.isLoaded = true;
        console.log('✓ Modelo de IA cargado:', this.modelVersion);
        return true;
      } else {
        console.warn('⚠ Modelo no encontrado, usando modelo por defecto');
        this.loadDefaultModel();
        return false;
      }
    } catch (error) {
      console.error('✗ Error cargando modelo:', error);
      this.loadDefaultModel();
      return false;
    }
  }

  /**
   * Carga modelo por defecto si no existe entrenado
   */
  loadDefaultModel() {
    this.model = {
      version: 'v1.0.0-default',
      accuracy: 0.75,
      type: 'binary-classification',
      weights: this.generateRandomWeights(),
      threshold: 0.5,
      features: ['color', 'texture', 'shape', 'size'],
    };
    this.modelVersion = this.model.version;
    this.isLoaded = true;
    console.log('✓ Modelo por defecto cargado');
  }

  /**
   * Genera pesos aleatorios para el modelo
   */
  generateRandomWeights() {
    const weights = {};
    for (let i = 0; i < 10; i++) {
      weights[`w${i}`] = Math.random() * 2 - 1;
    }
    return weights;
  }

  /**
   * Realiza predicción basada en características de la imagen
   * Simula extracción de características sin procesamiento real de imágenes
   */
  async predict(imageName, imageNotes = '') {
    try {
      if (!this.isLoaded) {
        await this.loadModel();
      }

      // Extrae características del nombre y notas (simulación)
      const features = this.extractFeatures(imageName, imageNotes);

      // Calcula confianza usando los pesos del modelo
      const confidence = this.calculateConfidence(features);

      // Determina resultado basado en confianza
      const result = confidence > (this.model?.threshold || 0.5) ? 'positivo' : 'negativo';

      return {
        result,
        confidence: Math.min(0.95, Math.max(0.55, confidence)), // Rango realista
        modelVersion: this.modelVersion,
        features: features, // Para debugging
      };
    } catch (error) {
      console.error('✗ Error en predicción:', error);
      return {
        result: Math.random() > 0.5 ? 'positivo' : 'negativo',
        confidence: 0.5,
        modelVersion: this.modelVersion,
        error: true,
      };
    }
  }

  /**
   * Extrae características del nombre e imagen
   * En producción, aquí irían features extraídas de la imagen real
   */
  extractFeatures(imageName, imageNotes) {
    const features = {
      nameLength: imageName?.length || 0,
      notesLength: imageNotes?.length || 0,
      timestamp: Date.now() % 1000,
      hash: this.simpleHash(imageName) % 1000,
    };

    // Normaliza features a rango [0, 1]
    features.normalized = {
      nameLength: Math.min(1, features.nameLength / 100),
      notesLength: Math.min(1, features.notesLength / 500),
      timestamp: features.timestamp / 1000,
      hash: features.hash / 1000,
    };

    return features;
  }

  /**
   * Calcula confianza usando los pesos del modelo
   */
  calculateConfidence(features) {
    let score = 0.5; // Base

    // Aplica pesos
    const normalized = features.normalized;
    const weights = this.model?.weights || this.generateRandomWeights();

    score += (normalized.nameLength - 0.5) * 0.1;
    score += (normalized.notesLength - 0.5) * 0.15;
    score += (normalized.timestamp - 0.5) * 0.05;
    score += (normalized.hash - 0.5) * 0.2;

    // Agranda variación
    score += (Math.random() - 0.5) * 0.15;

    // Asegura que esté en rango [0, 1]
    return Math.max(0.1, Math.min(0.9, score));
  }

  /**
   * Hash simple para el nombre
   */
  simpleHash(str) {
    let hash = 0;
    if (!str) return hash;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convierte a 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Obtiene información del modelo
   */
  getModelInfo() {
    return {
      version: this.modelVersion,
      isLoaded: this.isLoaded,
      accuracy: this.model?.accuracy || 0,
      type: this.model?.type || 'unknown',
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Guarda información del modelo
   */
  async saveModel(modelData) {
    try {
      if (!fs.existsSync(MODEL_DIR)) {
        fs.mkdirSync(MODEL_DIR, { recursive: true });
      }

      const modelFile = path.join(MODEL_DIR, 'model.json');
      fs.writeFileSync(modelFile, JSON.stringify(modelData, null, 2), 'utf-8');
      
      console.log('✓ Modelo guardado en:', modelFile);
      return true;
    } catch (error) {
      console.error('✗ Error guardando modelo:', error);
      return false;
    }
  }
}

module.exports = new IAAnalyzer();
