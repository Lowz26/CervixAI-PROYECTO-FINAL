import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  userName = 'Doctor';
  summary = {
    totalAnalyses: 0,
    positiveCount: 0,
    negativeCount: 0,
    lastAnalysis: null as any,
  };
  loading = true;
  errorMessage = '';

  showUploadModal = false;
  selectedFile: File | null = null;
  imageNotes = '';
  isAnalyzing = false;
  analysisError = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDashboard();
    const userData = localStorage.getItem('cervixai-user');
    if (userData) {
      try {
        this.userName = JSON.parse(userData).name || 'Doctor';
      } catch {
        this.userName = 'Doctor';
      }
    }
  }

  async loadDashboard() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const token = localStorage.getItem('cervixai-token');
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://cervixai-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        this.errorMessage = data.message || 'No se pudo cargar el dashboard';
        return;
      }

      this.summary = {
        totalAnalyses: data.summary.totalAnalyses,
        positiveCount: data.summary.positiveCount,
        negativeCount: data.summary.negativeCount,
        lastAnalysis: data.summary.lastAnalysis,
      };
    } catch (error) {
      this.errorMessage = 'Error de conexión con el backend';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openModal() {
    this.showUploadModal = true;
    this.selectedFile = null;
    this.imageNotes = '';
    this.analysisError = '';
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showUploadModal = false;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.cdr.detectChanges();
    }
  }

  async submitAnalysis() {
    if (!this.selectedFile) return;
    this.isAnalyzing = true;
    this.analysisError = '';
    this.cdr.detectChanges();

    try {
      const token = localStorage.getItem('cervixai-token');
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('imageNotes', this.imageNotes);

      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://cervixai-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        this.analysisError = data.message || 'Error al iniciar análisis';
        this.cdr.detectChanges();
        return;
      }

      await this.loadDashboard();
      this.closeModal();
      alert(`Análisis IA completado: ${data.report.result.toUpperCase()} (${(data.report.confidence * 100).toFixed(1)}%)`);
    } catch (err) {
      this.analysisError = 'No se pudo conectar al backend para iniciar el análisis';
      this.cdr.detectChanges();
    } finally {
      this.isAnalyzing = false;
      this.cdr.detectChanges();
    }
  }

  toggleDaltonism() {
    document.body.classList.toggle('daltonism-mode');
  }

  showNotification() {
    alert('No tienes notificaciones nuevas.');
  }

  showSettings() {
    alert('Función de configuración en desarrollo.');
  }
}