import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
      const response = await fetch('http://localhost:4000/api/dashboard', {
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
    }
  }

  async startAnalysis() {
    this.errorMessage = '';
    try {
      const token = localStorage.getItem('cervixai-token');
      const body = { imageName: `manual-${Date.now()}`, imageNotes: 'Análisis iniciado desde UI' };
      const response = await fetch('http://localhost:4000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        this.errorMessage = data.message || 'Error al iniciar análisis';
        return;
      }

      // Refresh dashboard and optionally show a brief confirmation
      await this.loadDashboard();
      alert('Análisis simulado completado y agregado al historial.');
    } catch (err) {
      this.errorMessage = 'No se pudo conectar al backend para iniciar el análisis';
    }
  }
}