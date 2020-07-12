import { async, TestBed } from '@angular/core/testing';
import { ApplicationFrameModule } from './application-frame.module';

describe('Application Frame', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ApplicationFrameModule]
    }).compileComponents();
  }));

  test.skip('skip', () => {
    // Skip
  });
});
