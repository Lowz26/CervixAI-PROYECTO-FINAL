import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { HistorialComponent } from './historial/historial';

export const routes: Routes = [
  { path: '', component: LoginComponent },             // Ruta inicial (Login)
  { path: 'dashboard', component: DashboardComponent }, // Ruta del Dashboard
  { path: 'historial', component: HistorialComponent }  // Ruta del Historial
];