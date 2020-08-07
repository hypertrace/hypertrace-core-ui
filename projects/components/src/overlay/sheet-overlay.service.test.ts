import { Component } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { Subject } from 'rxjs';
import { PopoverModule } from '../../popover/popover.module';
import { SheetSize } from '../sheet.component';
import { SheetOverlayService } from './sheet-overlay.service';

describe('Sheet overlay service', () => {
  const navigation$: Subject<void> = new Subject<void>();

  let spectator: SpectatorService<SheetOverlayService>;

  const createService = createServiceFactory({
    service: SheetOverlayService,
    imports: [PopoverModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: navigation$
      })
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  test('can close a popover on navigation', fakeAsync(() => {
    const popover = spectator.service.createSheet({
      showHeader: false,
      size: SheetSize.Medium,
      content: Component({
        selector: 'test-component',
        template: `<div>TEST</div>`
      })(class {})
    });
    popover.show();
    popover.closeOnNavigation();
    tick(); // CDK overlay is async

    expect(popover.closed).toBe(false);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe('(x|)', { x: undefined });
      expectObservable(recordObservable(popover.hidden$)).toBe('|'); // Record hidden/shown for test, since they're hot
      expectObservable(recordObservable(popover.shown$)).toBe('|');
      navigation$.next();
    });

    expect(popover.closed).toBe(true);
    flush(); // CDK cleans up overlay async
  }));
});
