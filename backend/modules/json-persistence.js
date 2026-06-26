/**
 * Módulo de Persistencia JSON
 * Mantiene un backup de datos en formato JSON
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../data');
const ANALYSES_FILE = path.join(BACKUP_DIR, 'analyses.json');
const TRAININGS_FILE = path.join(BACKUP_DIR, 'trainings.json');

class JSONPersistence {
  constructor() {
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  /**
   * Guarda análisis en JSON
   */
  saveAnalyses(analyses) {
    try {
      fs.writeFileSync(ANALYSES_FILE, JSON.stringify(analyses, null, 2), 'utf-8');
      console.log('✓ Análisis guardados en JSON');
      return true;
    } catch (error) {
      console.error('✗ Error guardando análisis JSON:', error);
      return false;
    }
  }

  /**
   * Carga análisis desde JSON
   */
  loadAnalyses() {
    try {
      if (fs.existsSync(ANALYSES_FILE)) {
        const data = fs.readFileSync(ANALYSES_FILE, 'utf-8');
        return JSON.parse(data || '[]');
      }
      return [];
    } catch (error) {
      console.error('✗ Error cargando análisis JSON:', error);
      return [];
    }
  }

  /**
   * Guarda entrenamientos en JSON
   */
  saveTrainings(trainings) {
    try {
      fs.writeFileSync(TRAININGS_FILE, JSON.stringify(trainings, null, 2), 'utf-8');
      console.log('✓ Entrenamientos guardados en JSON');
      return true;
    } catch (error) {
      console.error('✗ Error guardando entrenamientos JSON:', error);
      return false;
    }
  }

  /**
   * Carga entrenamientos desde JSON
   */
  loadTrainings() {
    try {
      if (fs.existsSync(TRAININGS_FILE)) {
        const data = fs.readFileSync(TRAININGS_FILE, 'utf-8');
        return JSON.parse(data || '[]');
      }
      return [];
    } catch (error) {
      console.error('✗ Error cargando entrenamientos JSON:', error);
      return [];
    }
  }

  /**
   * Exporta todas las bases de datos
   */
  exportAll(data) {
    try {
      const exportFile = path.join(BACKUP_DIR, `export-${Date.now()}.json`);
      fs.writeFileSync(exportFile, JSON.stringify(data, null, 2), 'utf-8');
      console.log('✓ Datos exportados a:', exportFile);
      return exportFile;
    } catch (error) {
      console.error('✗ Error exportando datos:', error);
      return null;
    }
  }

  /**
   * Obtiene información del archivo
   */
  getFileInfo() {
    const info = {};

    if (fs.existsSync(ANALYSES_FILE)) {
      const stats = fs.statSync(ANALYSES_FILE);
      info.analysesFile = {
        path: ANALYSES_FILE,
        size: stats.size,
        modified: stats.mtime,
      };
    }

    if (fs.existsSync(TRAININGS_FILE)) {
      const stats = fs.statSync(TRAININGS_FILE);
      info.trainingsFile = {
        path: TRAININGS_FILE,
        size: stats.size,
        modified: stats.mtime,
      };
    }

    return info;
  }
}

module.exports = new JSONPersistence();
