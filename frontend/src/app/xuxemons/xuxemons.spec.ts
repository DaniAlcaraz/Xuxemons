import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Xuxemons } from './xuxemons';

describe('Xuxemons', () => {
  let component: Xuxemons;
  let fixture: ComponentFixture<Xuxemons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Xuxemons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Xuxemons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
