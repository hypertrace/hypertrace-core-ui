import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';
import { StandardTableCellRendererType } from '../../types/standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'htc-text-table-cell-renderer',
  styleUrls: ['./text-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="{ clickable: this.clickable, 'first-column': this.isFirstColumn }"
      class="text-cell"
      [htcTooltip]="this.value"
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
  public parseValue(cellData: string): string {
    return cellData;
  }
}
