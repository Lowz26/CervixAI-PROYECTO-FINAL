import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
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

  recentAnalyses: any[] = [];

  showUploadModal = false;
  selectedFile: File | null = null;
  imageNotes = '';
  isAnalyzing = false;
  analysisError = '';
  
  showResultModal = false;
  analysisResultData: any = null;
  
  showSettingsModal = false;
  isDaltonismActive = false;
  
  currentLanguage = 'es';
  recoveryEmail = '';
  passwordChangeMessage = '';

  translations: any = {
    es: {
      sidebar: { history: 'Historial', newAnalysis: 'Nuevo Análisis', specialty: 'Oncología Ginecológica' },
      topbar: { mainDashboard: 'Dashboard Principal', colorblind: 'Modo Daltonismo' },
      welcome: { title: 'Bienvenido, Dr.', desc: 'Panel de control clínico para el análisis asistido por IA.' },
      loading: 'Cargando datos del dashboard...',
      error: 'Error de conexión con el backend',
      summary: { total: 'Total Analizados', positive: 'Resultados Positivos', negative: 'Resultados Negativos', trendPos: 'Datos de análisis recientes', trendNeu: 'Casos con resultado positivo', trendNeg: 'Casos con resultado negativo' },
      action: { title: 'Nuevo Análisis', desc: 'Inicie un nuevo proceso de análisis de imágenes colposcópicas utilizando el motor de visión computacional de CervixAI.', btn: 'Iniciar Análisis' },
      table: { title: 'Últimos Análisis Realizados', link: 'Ver Historial Completo', col1: 'FECHA', col2: 'ID PACIENTE', col3: 'TIPO DE PRUEBA', col4: 'RESULTADO', empty: 'No hay análisis recientes.' },
      footer: { use: 'Uso Clínico Profesional.', support: 'Soporte Técnico', privacy: 'Privacidad de Datos', protocol: 'Protocolo Médico' },
      modalUpload: { title: 'Subir Imagen Celular', drop: 'Haz clic para seleccionar una imagen', notes: 'Notas Clínicas (Opcional)', placeholder: 'Observaciones adicionales...', cancel: 'Cancelar', btn: 'Analizar Imagen', processing: 'Procesando IA...' },
      modalSettings: { title: 'Ajustes', profile: 'Perfil', photo: 'Foto de Perfil', photoDesc: 'Actualiza tu imagen visible.', change: 'Cambiar', security: 'Seguridad', password: 'Contraseña', passwordDesc: 'Cambia tu contraseña de acceso.', update: 'Actualizar', email: 'Correo de Recuperación', emailDesc: 'Añade un email alternativo.', save: 'Guardar', prefs: 'Preferencias', lang: 'Idioma', langDesc: 'Selecciona el idioma de la interfaz.', cb: 'Modo Daltonismo', cbDesc: 'Mejora el contraste visual.', logout: 'Cerrar Sesión' },
      alerts: { noNotif: 'No tienes notificaciones nuevas.', pwdChange: 'Se ha enviado un enlace de confirmación a tu correo.', emailSaved: 'Correo de recuperación configurado: ', photoUpdate: 'Tu foto de perfil ha sido actualizada exitosamente.', aiComplete: 'Análisis IA completado' }
    },
    en: {
      sidebar: { history: 'History', newAnalysis: 'New Analysis', specialty: 'Gynecologic Oncology' },
      topbar: { mainDashboard: 'Main Dashboard', colorblind: 'Colorblind Mode' },
      welcome: { title: 'Welcome, Dr.', desc: 'Clinical control panel for AI-assisted analysis.' },
      loading: 'Loading dashboard data...',
      error: 'Backend connection error',
      summary: { total: 'Total Analyzed', positive: 'Positive Results', negative: 'Negative Results', trendPos: 'Recent analysis data', trendNeu: 'Cases with positive results', trendNeg: 'Cases with negative results' },
      action: { title: 'New Analysis', desc: 'Start a new colposcopic image analysis process using the CervixAI computer vision engine.', btn: 'Start Analysis' },
      table: { title: 'Latest Analyses Performed', link: 'View Full History', col1: 'DATE', col2: 'PATIENT ID', col3: 'TEST TYPE', col4: 'RESULT', empty: 'No recent analyses.' },
      footer: { use: 'Professional Clinical Use.', support: 'Technical Support', privacy: 'Data Privacy', protocol: 'Medical Protocol' },
      modalUpload: { title: 'Upload Cellular Image', drop: 'Click to select an image', notes: 'Clinical Notes (Optional)', placeholder: 'Additional observations...', cancel: 'Cancel', btn: 'Analyze Image', processing: 'Processing AI...' },
      modalSettings: { title: 'Settings', profile: 'Profile', photo: 'Profile Photo', photoDesc: 'Update your visible image.', change: 'Change', security: 'Security', password: 'Password', passwordDesc: 'Change your access password.', update: 'Update', email: 'Recovery Email', emailDesc: 'Add an alternative email.', save: 'Save', prefs: 'Preferences', lang: 'Language', langDesc: 'Select the interface language.', cb: 'Colorblind Mode', cbDesc: 'Improves visual contrast.', logout: 'Logout' },
      alerts: { noNotif: 'You have no new notifications.', pwdChange: 'A confirmation link has been sent to your email.', emailSaved: 'Recovery email configured: ', photoUpdate: 'Your profile photo has been updated successfully.', aiComplete: 'AI Analysis completed' }
    }
  };

  get t() {
    return this.translations[this.currentLanguage];
  }

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

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
        this.errorMessage = data.message || this.t.error;
        return;
      }

      this.summary = {
        totalAnalyses: data.summary.totalAnalyses,
        positiveCount: data.summary.positiveCount,
        negativeCount: data.summary.negativeCount,
        lastAnalysis: data.summary.lastAnalysis,
      };
      
      this.recentAnalyses = data.recentAnalyses || [];
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
        this.analysisError = data.message || 'Error al iniciar análisis';
        this.cdr.detectChanges();
        return;
      }

      await this.loadDashboard();
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
}