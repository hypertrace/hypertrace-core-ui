import { Injectable, Injector, OnDestroy } from '@angular/core';
import { PopoverFixedPositionLocation, PopoverPositionType } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { SheetOverlayConfig } from './sheet/sheet';

import { Subscription } from 'rxjs';
import { ModalOverlayConfig } from './modal/modal';
import { ModalOverlayComponent } from './modal/modal-overlay.component';
import { SheetOverlayComponent } from './sheet/sheet-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class OverlayService implements OnDestroy {
  private activePopover?: PopoverRef;
  private closeSubscription?: Subscription;

  public constructor(private readonly popoverService: PopoverService, private readonly defaultInjector: Injector) {}

  public ngOnDestroy(): void {
    this.closeSubscription?.unsubscribe();
  }

  public createSheet(config: SheetOverlayConfig, injector: Injector = this.defaultInjector): PopoverRef {
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: SheetOverlayComponent,
      parentInjector: injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.RightUnderHeader
      },
      data: config
    });

    popover.closeOnNavigation();

    this.setActivePopover(popover);

    return popover;
  }

  public createModal(config: ModalOverlayConfig, injector: Injector = this.defaultInjector): PopoverRef {
    this.activePopover?.close();

    const popover = this.popoverService.drawPopover({
      componentOrTemplate: ModalOverlayComponent,
      parentInjector: injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Centered
      },
      data: config
    });

    popover.closeOnNavigation();

    this.setActivePopover(popover);

    return popover;
  }

  private setActivePopover(popover: PopoverRef): void {
    this.closeSubscription?.unsubscribe();
    this.activePopover?.close();

    this.activePopover = popover;
    this.activePopover.closeOnNavigation();
    this.closeSubscription = this.activePopover.closed$.subscribe(() => (this.activePopover = undefined));
  }
}
