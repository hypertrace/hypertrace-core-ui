import { Injectable, Injector, TemplateRef, Type } from '@angular/core';
import { PopoverFixedPositionLocation, PopoverPositionType } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { PopoverService } from '../../popover/popover.service';
import { SheetSize } from '../sheet.component';
import { SheetOverlayComponent } from './sheet-overlay.component';

@Injectable()
export class SheetOverlayService {
  public constructor(private readonly popoverService: PopoverService, private readonly injector: Injector) {}

  public createSheet(config: SheetOverlayConfig): PopoverRef {
    const popover = this.popoverService.drawPopover({
      componentOrTemplate: SheetOverlayComponent,
      parentInjector: this.injector,
      position: {
        type: PopoverPositionType.Fixed,
        location: config.positionLocation ? config.positionLocation : PopoverFixedPositionLocation.RightUnderHeader
      },
      data: config
    });

    if (config.closeOnNavigate !== false) {
      // Default to close on navigate if undefined
      popover.closeOnNavigation();
    }

    return popover;
  }
}

export interface SheetOverlayConfig {
  showHeader?: boolean;
  title?: string;
  size: SheetSize;
  closeOnNavigate?: boolean;
  content: TemplateRef<unknown> | Type<unknown>;
  positionLocation?: PopoverFixedPositionLocation;
}
