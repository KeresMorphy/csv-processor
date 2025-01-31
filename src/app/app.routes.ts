import { Routes } from '@angular/router';
import { CargarCsvComponent } from './cargar-csv/cargar-csv.component';

export const routes: Routes = [
  {
    path: '',
    component: CargarCsvComponent,
    pathMatch: 'full'
  }
];
