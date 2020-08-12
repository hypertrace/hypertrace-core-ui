import { Injectable, Injector } from '@angular/core';
import { PopoverFixedPositionLocation, PopoverPositionType } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { PopoverService } from '../popover/popover.service';
import { SheetOverlayConfig } from './sheet/sheet';

import { ModalOverlayConfig } from './modal/modal';
import { ModalOverlayComponent } from './modal/modal-overlay.component';
import { SheetOverlayComponent } from './sheet/sheet-overlay.component';

@Injectable()
export class OverlayService {
  public constructor(private readonly popoverService: PopoverService, private readonly injector: Injector) {}

  public createSheet(config: SheetOverlayConfig): PopoverRef {
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: SheetOverlayComponent,
      parentInjector: this.injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.RightUnderHeader
      },
      data: config
    });

    return popover;
  }

  public createModal(config: ModalOverlayConfig): PopoverRef {
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: ModalOverlayComponent,
      parentInjector: this.injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Centered
      },
      data: config
    });

    return popover;
  }
}
