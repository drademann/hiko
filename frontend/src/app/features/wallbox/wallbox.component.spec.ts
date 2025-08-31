import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WallboxComponent } from './wallbox.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('WallboxComponent', () => {
  let component: WallboxComponent;
  let fixture: ComponentFixture<WallboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WallboxComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(WallboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
