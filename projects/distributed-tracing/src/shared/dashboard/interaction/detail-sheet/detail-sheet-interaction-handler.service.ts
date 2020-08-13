import { Injectable, Injector } from '@angular/core';
import { OverlayService, PopoverRef, SheetSize } from '@hypertrace/components';
import {
  DetailSheetInteractionContainerComponent,
  DETAIL_SHEET_INTERACTION_MODEL
} from './container/detail-sheet-interaction-container.component';

@Injectable()
export class DetailSheetInteractionHandlerService {
  public constructor(private readonly injector: Injector, private readonly overlayService: OverlayService) {}

  public showSheet(detailModel: object, sheetSize: SheetSize = SheetSize.Medium, title?: string): PopoverRef {
    return this.overlayService.createSheet(
      {
        content: DetailSheetInteractionContainerComponent,
        size: sheetSize,
        showHeader: true,
        title: title
      },
      this.buildDetailOverlayInjector(detailModel)
    );
  }

  private buildDetailOverlayInjector(detailModel: object): Injector {
    return Injector.create({
      providers: [
        {
          provide: DETAIL_SHEET_INTERACTION_MODEL,
          useValue: detailModel
        }
      ],
      parent: this.injector
    });
  }
}
