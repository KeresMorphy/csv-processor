import { Routes } from '@angular/router';
import { CargarCsvComponent } from './cargar-csv/cargar-csv.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'cargar-csv', // Redirige a 'cargar-csv'
    pathMatch: 'full'
  },
  {
    path: 'cargar-csv', // Ruta principal
    component: CargarCsvComponent
  }
];
