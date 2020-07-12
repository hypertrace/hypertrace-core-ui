import { ChangeDetectionStrategy, Component, Inject, TemplateRef, Type } from '@angular/core';
import { GLOBAL_HEADER_HEIGHT } from '@hypertrace/common';
import { POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { SheetSize } from '../sheet.component';
import { SheetOverlayConfig } from './sheet-overlay.service';

@Component({
  selector: 'htc-sheet-overlay',
  styleUrls: ['./sheet-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-sheet
      class="overlay-sheet"
      [size]="this.size"
      [showHeader]="this.showHeader"
      [sheetTitle]="this.title"
      (visibleChange)="this.closeSheet()"
    >
      <ng-container *ngIf="this.isComponentSheet; else templateRenderer">
        <ng-container *ngComponentOutlet="this.renderer"></ng-container>
      </ng-container>
      <ng-template #templateRenderer>
        <ng-container *ngTemplateOutlet="this.renderer"></ng-container>
      </ng-template>
    </htc-sheet>
  `
})
export class SheetOverlayComponent {
  public readonly showHeader: boolean;
  public readonly title: string;
  public readonly size: SheetSize;
  public readonly isComponentSheet: boolean;
  public readonly renderer: TemplateRef<unknown> | Type<unknown>;

  public constructor(
    private readonly popoverRef: PopoverRef,
    @Inject(POPOVER_DATA) sheetConfig: SheetOverlayConfig,
    @Inject(GLOBAL_HEADER_HEIGHT) globalHeaderHeight: string
  ) {
    this.showHeader = sheetConfig.showHeader === true;
    this.title = sheetConfig.title === undefined ? '' : sheetConfig.title;
    this.size = sheetConfig.size;
    this.isComponentSheet = !(sheetConfig.content instanceof TemplateRef);
    this.renderer = sheetConfig.content;
    popoverRef.height(`calc(100vh - ${globalHeaderHeight})`);
  }

  public closeSheet(): void {
    this.popoverRef.close();
  }
}
