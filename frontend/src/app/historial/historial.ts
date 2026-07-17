import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
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
  
  showResultModal = false;
  analysisResultData: any = null;

  currentPage = 1;
  pageSize = 10;
  
  showSettingsModal = false;
  isDaltonismActive = false;
  currentLanguage = 'es';
  recoveryEmail = '';
  passwordChangeMessage = '';

  translations: any = {
    es: {
      sidebar: { history: 'Historial', newAnalysis: 'Nuevo Análisis', specialty: 'Oncología Ginecológica', panel: 'PANEL DE CONTROL' },
      topbar: { colorblind: 'Modo Daltonismo' },
      loading: 'Cargando historial...',
      error: 'Error de conexión con el backend',
      history: { title: 'Historial de Pacientes', desc: 'Registros clínicos y diagnósticos procesados por CervixAI.', searchPlaceholder: 'Buscar por ID o Fecha...', filter: 'Filtrar', filterDev: 'Función de filtro avanzada en desarrollo.', colDate: 'FECHA DE ESTUDIO', colSample: 'MUESTRA (MINIATURA)', colId: 'ID PACIENTE', colResult: 'RESULTADO', colConf: 'CONFIANZA AI', empty: 'No hay registros disponibles.', abnormal: 'ANORMAL', normal: 'NORMAL', showing: 'Mostrando', of: 'de', results: 'resultados' },
      summary: { total: 'Total Analizados', trendTotal: 'Datos actualizados', avgConf: 'Confianza Promedio', trendConf: 'Basado en todos los análisis', critical: 'Alertas Críticas', trendCritical: 'Pendientes de revisión manual' },
      footer: { use: 'Uso Clínico Profesional.', support: 'Soporte Técnico', privacy: 'Privacidad de Datos', protocol: 'Protocolo Médico' },
      modalUpload: { title: 'Subir Imagen Celular', drop: 'Haz clic para seleccionar una imagen', notes: 'Notas Clínicas (Opcional)', placeholder: 'Observaciones adicionales...', cancel: 'Cancelar', btn: 'Analizar Imagen', processing: 'Procesando IA...' },
      modalSettings: { title: 'Ajustes', profile: 'Perfil', photo: 'Foto de Perfil', photoDesc: 'Actualiza tu imagen visible.', change: 'Cambiar', security: 'Seguridad', password: 'Contraseña', passwordDesc: 'Cambia tu contraseña de acceso.', update: 'Actualizar', email: 'Correo de Recuperación', emailDesc: 'Añade un email alternativo.', save: 'Guardar', prefs: 'Preferencias', lang: 'Idioma', langDesc: 'Selecciona el idioma de la interfaz.', cb: 'Modo Daltonismo', cbDesc: 'Mejora el contraste visual.', logout: 'Cerrar Sesión' },
      alerts: { noNotif: 'No tienes notificaciones nuevas.', pwdChange: 'Se ha enviado un enlace de confirmación a tu correo.', emailSaved: 'Correo de recuperación configurado: ', photoUpdate: 'Tu foto de perfil ha sido actualizada exitosamente.', aiComplete: 'Análisis IA completado' }
    },
    en: {
      sidebar: { history: 'History', newAnalysis: 'New Analysis', specialty: 'Gynecologic Oncology', panel: 'CONTROL PANEL' },
      topbar: { colorblind: 'Colorblind Mode' },
      loading: 'Loading history...',
      error: 'Backend connection error',
      history: { title: 'Patient History', desc: 'Clinical records and diagnoses processed by CervixAI.', searchPlaceholder: 'Search by ID or Date...', filter: 'Filter', filterDev: 'Advanced filter function in development.', colDate: 'STUDY DATE', colSample: 'SAMPLE (THUMBNAIL)', colId: 'PATIENT ID', colResult: 'RESULT', colConf: 'AI CONFIDENCE', empty: 'No records available.', abnormal: 'ABNORMAL', normal: 'NORMAL', showing: 'Showing', of: 'of', results: 'results' },
      summary: { total: 'Total Analyzed', trendTotal: 'Updated data', avgConf: 'Average Confidence', trendConf: 'Based on all analyses', critical: 'Critical Alerts', trendCritical: 'Pending manual review' },
      footer: { use: 'Professional Clinical Use.', support: 'Technical Support', privacy: 'Data Privacy', protocol: 'Medical Protocol' },
      modalUpload: { title: 'Upload Cellular Image', drop: 'Click to select an image', notes: 'Clinical Notes (Optional)', placeholder: 'Additional observations...', cancel: 'Cancel', btn: 'Analyze Image', processing: 'Processing AI...' },
      modalSettings: { title: 'Settings', profile: 'Profile', photo: 'Profile Photo', photoDesc: 'Update your visible image.', change: 'Change', security: 'Security', password: 'Password', passwordDesc: 'Change your access password.', update: 'Update', email: 'Recovery Email', emailDesc: 'Add an alternative email.', save: 'Save', prefs: 'Preferences', lang: 'Language', langDesc: 'Select the interface language.', cb: 'Colorblind Mode', cbDesc: 'Improves visual contrast.', logout: 'Logout' },
      alerts: { noNotif: 'You have no new notifications.', pwdChange: 'A confirmation link has been sent to your email.', emailSaved: 'Recovery email configured: ', photoUpdate: 'Your profile photo has been updated successfully.', aiComplete: 'AI Analysis completed' }
    }
  };

  get t() {
    return this.translations[this.currentLanguage];
  }

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

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

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
        this.errorMessage = data.message || this.t.error;
        return;
      }

      this.items = data.items || [];
      this.totalAnalyses = this.items.length;
      this.avgConfidence = this.totalAnalyses > 0 ? this.items.reduce((acc: number, item: any) => acc + (item.confidence || 0.5), 0) / this.totalAnalyses : 0;
      this.criticalAlerts = this.items.filter((item: any) => item.result === 'positivo').length;
    } catch (error) {
      this.errorMessage = this.t.error;
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
        this.analysisError = data.message || this.t.error;
        this.cdr.detectChanges();
        return;
      }

      await this.loadHistorial();
      this.closeModal();
      this.analysisResultData = {
        result: data.report.result.toUpperCase(),
        confidence: (data.report.confidence * 100).toFixed(1)
      };
      this.showResultModal = true;
    } catch (err) {
      this.analysisError = this.t.error;
      this.cdr.detectChanges();
    } finally {
      this.isAnalyzing = false;
      this.cdr.detectChanges();
    }
  }

  filtrar() {
    alert(this.t.history.filterDev);
  }

  toggleDaltonism() {
    this.isDaltonismActive = !this.isDaltonismActive;
    if (this.isDaltonismActive) {
      document.body.classList.add('daltonism-mode');
    } else {
      document.body.classList.remove('daltonism-mode');
    }
  }

  showNotification() {
    alert(this.t.alerts.noNotif);
  }

  showSettings() {
    this.isDaltonismActive = document.body.classList.contains('daltonism-mode');
    this.showSettingsModal = true;
    this.cdr.detectChanges();
  }

  closeSettings() {
    this.showSettingsModal = false;
    this.cdr.detectChanges();
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
  }

  logout() {
    localStorage.removeItem('cervixai-token');
    localStorage.removeItem('cervixai-user');
    this.router.navigate(['/']);
  }

  changePassword() {
    this.passwordChangeMessage = this.t.alerts.pwdChange;
    this.cdr.detectChanges();
  }

  saveRecoveryEmail() {
    alert(this.t.alerts.emailSaved + this.recoveryEmail);
  }

  onProfilePhotoSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      alert(this.t.alerts.photoUpdate);
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }
}