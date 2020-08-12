import { PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { OverlayService, PopoverRef, SheetSize } from '@hypertrace/components';
import {
  DetailSheetInteractionContainerComponent,
  DETAIL_SHEET_INTERACTION_MODEL
} from './container/detail-sheet-interaction-container.component';

@Injectable({
  providedIn: 'root'
})
export class DetailSheetInteractionHandlerService {
  public constructor(private readonly injector: Injector, private readonly overlayService: OverlayService) {}

  public showSheet(detailModel: object, sheetSize: SheetSize = SheetSize.Medium): PopoverRef {
    return this.overlayService.createSheet(
      {
        content: DetailSheetInteractionContainerComponent,
        size: sheetSize
      },
      this.buildDetailOverlayInjector(detailModel)
    );
  }

  private buildDetailOverlayInjector(detailModel: object): Injector {
    return new PortalInjector(
      this.injector,
      new WeakMap<object, unknown>([[DETAIL_SHEET_INTERACTION_MODEL, detailModel]])
    );
  }
}
