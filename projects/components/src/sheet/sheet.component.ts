import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonStyle } from '../button/button';

@Component({
  selector: 'htc-sheet',
  styleUrls: ['./sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.visible" class="htc-sheet" [ngClass]="'sheet-size-' + this.size">
      <div *ngIf="this.showHeader" class="header">
        <h3 class="header-title">{{ sheetTitle }}</h3>
        <htc-button
          class="close-button"
          icon="${IconType.CloseCircle}"
          display="${ButtonStyle.Outlined}"
          htcTooltip="Close Sheet"
          (click)="this.close()"
        >
        </htc-button>
      </div>
      <div class="content-wrapper">
        <div class="content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class SheetComponent {
  @Input()
  public sheetTitle: string = '';

  @Input()
  public showHeader: boolean = true;

  @Input()
  public size: SheetSize = SheetSize.Small;

  @Input()
  public visible: boolean = true;

  @Output()
  public readonly visibleChange: EventEmitter<boolean> = new EventEmitter();

  public close(): void {
    if (!this.visible) {
      return;
    }
    this.visible = false;
    this.visibleChange.emit(false);
  }

  public open(): void {
    if (this.visible) {
      return;
    }
    this.visible = true;
    this.visibleChange.emit(true);
  }
}

export const enum SheetSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}
