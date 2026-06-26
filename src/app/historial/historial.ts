import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {
  items: any[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    this.loadHistorial();
  }

  async loadHistorial() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const token = localStorage.getItem('cervixai-token');
      const response = await fetch('http://localhost:4000/api/historial', {
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
    } catch (error) {
      this.errorMessage = 'Error de conexión con el backend';
    } finally {
      this.loading = false;
    }
  }
}