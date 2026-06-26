/**
 * Módulo de Base de Datos SQLite
 * Maneja persistencia de usuarios, análisis y entrenamientos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/cervixai.db');

class Database {
  constructor() {
    this.db = null;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✓ SQLite conectado:', DB_PATH);
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Tabla de usuarios
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Tabla de análisis
        this.db.run(`
          CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            imageName TEXT NOT NULL,
            notes TEXT,
            result TEXT NOT NULL,
            confidence REAL DEFAULT 0.5,
            modelVersion TEXT,
            analyzedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            analyst TEXT NOT NULL
          )
        `);

        // Tabla de entrenamientos
        this.db.run(`
          CREATE TABLE IF NOT EXISTS trainings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            modelVersion TEXT UNIQUE NOT NULL,
            accuracy REAL,
            loss REAL,
            samplesCount INTEGER,
            trainingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            modelPath TEXT NOT NULL
          )
        `, (err) => {
          if (err) reject(err);
          else {
            this.seedDefaultUser()
              .then(() => resolve())
              .catch(reject);
          }
        });
      });
    });
  }

  seedDefaultUser() {
    return new Promise((resolve, reject) => {
      const defaultUser = {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
      };

      this.db.run(
        `INSERT OR IGNORE INTO users (username, password, name) VALUES (?, ?, ?)`,
        [defaultUser.username, defaultUser.password, defaultUser.name],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // USUARIOS
  getUser(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // ANÁLISIS
  insertAnalysis(analysisData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO analyses (imageName, notes, result, confidence, modelVersion, analyst)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          analysisData.imageName,
          analysisData.notes,
          analysisData.result,
          analysisData.confidence,
          analysisData.modelVersion,
          analysisData.analyst,
        ],
        function (err) {
          if (err) reject(err);
          else
            resolve({
              id: this.lastID,
              ...analysisData,
              analyzedAt: new Date().toISOString(),
            });
        }
      );
    });
  }

  getAnalyses() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analyses ORDER BY analyzedAt DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  getAnalysis(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM analyses WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  deleteAnalysis(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM analyses WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // ESTADÍSTICAS
  getStats() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
           COUNT(*) as totalAnalyses,
           SUM(CASE WHEN result = 'positivo' THEN 1 ELSE 0 END) as positiveCount,
           SUM(CASE WHEN result = 'negativo' THEN 1 ELSE 0 END) as negativeCount,
           AVG(confidence) as avgConfidence
         FROM analyses`,
        (err, row) => {
          if (err) reject(err);
          else
            resolve({
              totalAnalyses: row?.totalAnalyses || 0,
              positiveCount: row?.positiveCount || 0,
              negativeCount: row?.negativeCount || 0,
              avgConfidence: row?.avgConfidence || 0,
            });
        }
      );
    });
  }

  // ENTRENAMIENTOS
  insertTraining(trainingData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO trainings (modelVersion, accuracy, loss, samplesCount, modelPath)
         VALUES (?, ?, ?, ?, ?)`,
        [
          trainingData.modelVersion,
          trainingData.accuracy,
          trainingData.loss,
          trainingData.samplesCount,
          trainingData.modelPath,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...trainingData });
        }
      );
    });
  }

  getLatestTraining() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM trainings ORDER BY trainingDate DESC LIMIT 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            console.log('✓ Conexión SQLite cerrada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
