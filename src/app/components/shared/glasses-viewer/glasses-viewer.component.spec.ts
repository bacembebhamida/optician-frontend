import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlassesViewerComponent } from './glasses-viewer.component';

describe('GlassesViewerComponent', () => {
  let component: GlassesViewerComponent;
  let fixture: ComponentFixture<GlassesViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlassesViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlassesViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
