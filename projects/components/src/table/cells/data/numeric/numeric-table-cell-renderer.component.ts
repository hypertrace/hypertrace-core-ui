import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';
import { StandardTableCellRendererType } from '../../types/standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'htc-numeric-table-cell-renderer',
  styleUrls: ['./numeric-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="{ clickable: this.clickable }" class="numeric-cell" [htcTooltip]="this.value">
      {{ this.value | htcDisplayNumber }}
    </div>
  `
})
@TableCellRenderer({
  type: StandardTableCellRendererType.Number,
  alignment: TableCellAlignmentType.Right
})
export class NumericTableCellRendererComponent extends TableCellRendererComponent<CellData, Value> {
  public parseValue(cellData: CellData): Value {
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
