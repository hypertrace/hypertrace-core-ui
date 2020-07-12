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
    <div [ngClass]="{ clickable: this.clickable }" class="numeric-cell" [htcTooltip]="this.value">
      {{ this.value | htcDisplayNumber }}
    </div>
  `
})
@TableCellRenderer({
  type: StandardTableCellRendererType.Number,
  alignment: TableCellAlignmentType.Right
})
export class NumericTableCellRendererComponent extends TableCellRendererComponent<Raw, Parsed> {
  protected parseValue(raw: Raw): Parsed {
    switch (typeof raw) {
      case 'number':
        return raw;
      case 'object':
        return raw.value;
      default:
        return undefined;
    }
  }
}

type Raw = number | { value: number };
type Parsed = number | undefined;
