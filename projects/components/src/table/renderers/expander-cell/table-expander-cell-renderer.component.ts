import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableRowState } from '../../table-api';
import { StandardTableCellRendererType } from '../standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../table-cell-alignment-type';
import { TableCellRenderer } from '../table-cell-renderer';
import { TableCellRendererComponent } from '../table-cell-renderer.component';

@Component({
  selector: 'htc-table-expander-cell-renderer',
  styleUrls: ['./table-expander-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row-expander-cell" (click)="this.onClick()">
      <htc-expander-toggle
        *ngIf="!this.value.leaf"
        [expanded]="this.value.expanded"
        [showTooltip]="false"
      ></htc-expander-toggle>
    </div>
  `
})
@TableCellRenderer({
  type: StandardTableCellRendererType.RowExpander,
  alignment: TableCellAlignmentType.Center
})
export class TableExpanderCellRendererComponent extends TableCellRendererComponent<TableRowState> {
  protected parseValue(cellData: TableRowState): TableRowState {
    return cellData;
  }
}
