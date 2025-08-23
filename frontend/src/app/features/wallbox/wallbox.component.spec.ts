import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WallboxComponent } from './wallbox.component';

describe('WallboxComponent', () => {
  let component: WallboxComponent;
  let fixture: ComponentFixture<WallboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WallboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WallboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
