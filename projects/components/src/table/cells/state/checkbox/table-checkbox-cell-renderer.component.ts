import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableRowState } from '../../../table-api';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';
import { StandardTableCellRendererType } from '../../types/standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'htc-table-checkbox-cell-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row-checkbox-cell">
      <htc-checkbox [checked]="this.value.selected"></htc-checkbox>
    </div>
  `
})
@TableCellRenderer({
  type: StandardTableCellRendererType.Checkbox,
  alignment: TableCellAlignmentType.Center
})
export class TableCheckboxCellRendererComponent extends TableCellRendererComponent<TableRowState> {
  public parseValue(cellData: TableRowState): TableRowState {
    return cellData;
  }
}
