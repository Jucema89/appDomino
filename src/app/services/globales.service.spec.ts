import { TestBed } from '@angular/core/testing';

import { GlobalesService } from './globales.service';

describe('GlobalesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalesService = TestBed.get(GlobalesService);
    expect(service).toBeTruthy();
  });
});
