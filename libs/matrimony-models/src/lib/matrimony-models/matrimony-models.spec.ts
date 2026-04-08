import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatrimonyModels } from './matrimony-models';

describe('MatrimonyModels', () => {
  let component: MatrimonyModels;
  let fixture: ComponentFixture<MatrimonyModels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrimonyModels],
    }).compileComponents();

    fixture = TestBed.createComponent(MatrimonyModels);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
