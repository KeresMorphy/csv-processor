import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Papa from 'papaparse';
import { Chart } from 'chart.js';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-cargar-csv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargar-csv.component.html',
  styleUrls: ['./cargar-csv.component.css'],
})
export class CargarCsvComponent implements OnInit {
  csvData: any[] = []; // Datos procesados del archivo CSV
  filteredData: any[] = []; // Datos filtrados para la tabla
  filteredBranchEvents: { [key: string]: { count: number, events: string[] } } = {}; // Eventos filtrados por sucursal
  headers: string[] = []; // Encabezados del CSV
  eventTypes: string[] = ['Perdida de video', 'Deteccion movimiento', 'Cruce linea', 'Fuera de linea']; // Tipos de eventos disponibles
  selectedEventType: string = ''; // Tipo de evento seleccionado
  selectedDeviceName: string = ''; // Sucursal (Dispositivo) seleccionado
  deviceNames: string[] = []; // Lista de nombres de dispositivos (sucursales)

  // Contadores para los tipos de evento
  lostVideoEvents: number = 0;
  motionDetectionEvents: number = 0;
  lineCrossingEvents: number = 0;
  offlineEvents: number = 0;

  // Mapa de eventos por sucursal (dispositivo)
  branchEvents: { [key: string]: { count: number, events: string[] } } = {};

  // Variable para el gráfico
  branchChart: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.renderChart();
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          this.csvData = result.data;
          this.headers = Object.keys(this.csvData[0]);
          this.filteredData = [...this.csvData]; // Inicialmente todos los datos se muestran
          this.deviceNames = [...new Set(this.csvData.map((row) => row['Device Name']))]; // Lista de sucursales únicas

          // Calcular la cantidad de cada tipo de evento y la sucursal
          this.calculateEventCounts();
          this.filterData(); // Filtra los datos desde el principio
          this.updateChart(); // Actualizar el gráfico con los nuevos datos
          console.log('Datos CSV procesados:', this.csvData);
        },
        error: (error) => {
          console.error('Error al procesar el archivo:', error);
        },
      });
    }
  }

  filterData(): void {
    this.filteredData = this.csvData.filter((row) => {
      const matchesEventType = this.selectedEventType
        ? row['Event Type'] === this.selectedEventType
        : true;
      const matchesDeviceName = this.selectedDeviceName
        ? row['Device Name'] === this.selectedDeviceName
        : true;
      return matchesEventType && matchesDeviceName;
    });

    console.log('Datos filtrados:', this.filteredData); // Depuración

    this.filteredBranchEvents = {}; // Reseteamos el mapa de eventos por sucursal

    // Filtramos y contamos los eventos para cada sucursal
    this.filteredData.forEach((row) => {
      const deviceName = row['Device Name'];
      const eventType = row['Event Type'];

      // Inicializamos la sucursal si no existe en el mapa
      if (!this.filteredBranchEvents[deviceName]) {
        this.filteredBranchEvents[deviceName] = { count: 0, events: [] };
      }

      // Agregamos el tipo de evento al dispositivo correspondiente
      if (!this.filteredBranchEvents[deviceName].events.includes(eventType)) {
        this.filteredBranchEvents[deviceName].events.push(eventType);
      }

      // Incrementar el contador de eventos para la sucursal
      this.filteredBranchEvents[deviceName].count++;
    });

    console.log('Eventos por sucursal:', this.filteredBranchEvents); // Depuración

    this.updateChart(); // Actualizar el gráfico después de filtrar
  }

  calculateEventCounts(): void {
    this.lostVideoEvents = 0;
    this.motionDetectionEvents = 0;
    this.lineCrossingEvents = 0;
    this.offlineEvents = 0;
    this.branchEvents = {}; // Reseteamos el mapa de sucursales

    this.csvData.forEach((row) => {
      const deviceName = row['Device Name'];
      const eventType = row['Event Type'];

      // Inicializamos la sucursal si no existe en el mapa
      if (!this.branchEvents[deviceName]) {
        this.branchEvents[deviceName] = { count: 0, events: [] };
      }

      // Agregamos el tipo de evento al dispositivo correspondiente
      if (!this.branchEvents[deviceName].events.includes(eventType)) {
        this.branchEvents[deviceName].events.push(eventType);
      }

      // Incrementar el contador de eventos para la sucursal
      this.branchEvents[deviceName].count++;

      // Contar los eventos por tipo
      if (eventType === 'Perdida de video') {
        this.lostVideoEvents++;
      } else if (eventType === 'Deteccion movimiento') {
        this.motionDetectionEvents++;
      } else if (eventType === 'Cruce linea') {
        this.lineCrossingEvents++;
      } else if (eventType === 'Fuera de linea') {
        this.offlineEvents++;
      }
    });
  }

  renderChart() {
    if (isPlatformBrowser(this.platformId)) {
      const ctx = document.getElementById('branchChart') as HTMLCanvasElement;
      this.branchChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [], // Inicialmente vacío
          datasets: [{
            label: 'Eventos por Sucursal',
            data: [], // Inicialmente vacío
            backgroundColor: '#007bff',
            borderColor: '#0056b3',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  updateChart() {
    if (this.branchChart) {
      const labels = Object.keys(this.filteredBranchEvents);
      const data = labels.map((label) => this.filteredBranchEvents[label].count);

      this.branchChart.data.labels = labels;
      this.branchChart.data.datasets[0].data = data;
      this.branchChart.update(); // Actualizar el gráfico
    }
  }

  // Método para contar cuántas veces ocurre un evento específico en una sucursal
  getEventCount(deviceName: string, eventType: string): number {
    return this.filteredData.filter(
      (row) => row['Device Name'] === deviceName && row['Event Type'] === eventType
    ).length;
  }
}
