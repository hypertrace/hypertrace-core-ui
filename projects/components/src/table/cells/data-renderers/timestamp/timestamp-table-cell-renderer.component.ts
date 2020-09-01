import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateFormatMode, DateFormatOptions } from '@hypertrace/common';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'htc-timestamp-table-cell-renderer',
  styleUrls: ['./timestamp-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cell-value" [htcTooltip]="this.value | htcDisplayDate: this.dateFormat">
      {{ this.value | htcDisplayDate: this.dateFormat }}
    </div>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.Timestamp,
  alignment: TableCellAlignmentType.Right,
  parser: CoreTableCellParserType.Timestamp
})
export class TimestampTableCellRendererComponent extends TableCellRendererBase<Date | number> {
  public readonly dateFormat: DateFormatOptions = {
    mode: DateFormatMode.DateAndTimeWithSeconds
  };
}
