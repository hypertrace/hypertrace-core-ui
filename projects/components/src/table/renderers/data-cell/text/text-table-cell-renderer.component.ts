import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StandardTableCellRendererType } from '../../standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../table-cell-alignment-type';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';

@Component({
  selector: 'htc-text-table-cell-renderer',
  styleUrls: ['./text-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="{ clickable: this.clickable, 'first-column': this.isFirstColumn }"
      class="text-cell"
      [htcTooltip]="this.value"
      (click)="this.onClick()"
    >
      {{ this.value }}
    </div>
  `
})
@TableCellRenderer({
  type: StandardTableCellRendererType.Text,
  alignment: TableCellAlignmentType.Left
})
export class TextTableCellRendererComponent extends TableCellRendererComponent<string> {
  protected parseValue(cellData: string): string {
    return cellData;
  }
}
