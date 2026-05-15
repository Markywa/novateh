import { TestBed } from '@angular/core/testing';

import { HtmlContentsService } from './html-contents.service';

describe('HtmlContentsService', () => {
  let service: HtmlContentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlContentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
