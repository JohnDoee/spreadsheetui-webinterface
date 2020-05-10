import { TestBed } from '@angular/core/testing';

import { SpreadsheetUIService } from './spreadsheet-ui.service';

describe('SpreadsheetUIService', () => {
  let service: SpreadsheetUIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpreadsheetUIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
