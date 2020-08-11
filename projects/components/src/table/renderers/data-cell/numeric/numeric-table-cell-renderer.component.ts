import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StandardTableCellRendererType } from '../../standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../table-cell-alignment-type';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';

@Component({
  selector: 'htc-numeric-table-cell-renderer',
  styleUrls: ['./numeric-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="{ clickable: this.clickable }"
      class="numeric-cell"
      [htcTooltip]="this.value"
      (click)="this.onClick()"
    >
      {{ this.value | htcDisplayNumber }}
    </div>
  `
})
@TableCellRenderer({
  type: StandardTableCellRendererType.Number,
  alignment: TableCellAlignmentType.Right
})
export class NumericTableCellRendererComponent extends TableCellRendererComponent<CellData, Value> {
  protected parseValue(cellData: CellData): Value {
    switch (typeof cellData) {
      case 'number':
        return cellData;
      case 'object':
        return cellData.value;
      default:
        return undefined;
    }
  }
}

type CellData = number | { value: number };
type Value = number | undefined;
