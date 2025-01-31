import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarCsvComponent } from './cargar-csv.component';

describe('CargarCsvComponent', () => {
  let component: CargarCsvComponent;
  let fixture: ComponentFixture<CargarCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargarCsvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
