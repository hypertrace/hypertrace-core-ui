import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableRowState } from '../../table-api';
import { StandardTableCellRendererType } from '../standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../table-cell-alignment-type';
import { TableCellRenderer } from '../table-cell-renderer';
import { TableCellRendererComponent } from '../table-cell-renderer.component';

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
  protected parseValue(raw: TableRowState): TableRowState {
    return raw;
  }
}
