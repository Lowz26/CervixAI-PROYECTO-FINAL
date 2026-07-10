import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {
  items: any[] = [];
  loading = true;
  errorMessage = '';

  totalAnalyses = 0;
  avgConfidence = 0;
  criticalAlerts = 0;

  showUploadModal = false;
  selectedFile: File | null = null;
  imageNotes = '';
  isAnalyzing = false;
  analysisError = '';

  currentPage = 1;
  pageSize = 10;

  get paginatedItems() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.items.length / this.pageSize) || 1;
  }

  get pages() {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadHistorial();
  }

  async loadHistorial() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const token = localStorage.getItem('cervixai-token');
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://cervixai-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/historial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        this.errorMessage = data.message || 'No se pudo cargar el historial';
        return;
      }

      this.items = data.items || [];
      this.totalAnalyses = this.items.length;
      this.avgConfidence = this.totalAnalyses > 0 ? this.items.reduce((acc: number, item: any) => acc + (item.confidence || 0.5), 0) / this.totalAnalyses : 0;
      this.criticalAlerts = this.items.filter((item: any) => item.result === 'positivo').length;
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

      await this.loadHistorial();
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

  filtrar() {
    alert('Función de filtro avanzada en desarrollo.');
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

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }
}