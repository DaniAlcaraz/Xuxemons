import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editarperfil } from './editarperfil';

describe('Editarperfil', () => {
  let component: Editarperfil;
  let fixture: ComponentFixture<Editarperfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editarperfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editarperfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
