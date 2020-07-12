import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconSize } from '../../../../icon/icon-size';
import { StandardTableCellRendererType } from '../../standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../table-cell-alignment-type';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';

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
  protected parseValue(raw: string): string {
    return raw;
  }
}
