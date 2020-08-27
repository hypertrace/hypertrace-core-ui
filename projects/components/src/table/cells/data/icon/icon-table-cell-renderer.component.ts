import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconSize } from '../../../../icon/icon-size';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';
import { StandardTableCellRendererType } from '../../types/standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'htc-icon-table-cell-renderer',
  styleUrls: ['./icon-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon-cell" [ngClass]="{ clickable: this.clickable }">
      <htc-icon [icon]="this.value" size="${IconSize.Small}" [showTooltip]="true"></htc-icon>
    </div>
  `
})
@TableCellRenderer({
  type: StandardTableCellRendererType.Icon,
  alignment: TableCellAlignmentType.Center
})
export class IconTableCellRendererComponent extends TableCellRendererComponent<string> {
  public parseValue(cellData: string): string {
    return cellData;
  }
}