import { TestBed } from '@angular/core/testing';

import { Mochila } from './mochila';

describe('Mochila', () => {
  let service: Mochila;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mochila);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
