import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DateFormatMode, DateFormatOptions } from '@hypertrace/common';
import { TableColumnConfigExtended, TableRow } from '../../../table-api';
import { TABLE_CELL_DATA, TABLE_COLUMN_CONFIG, TABLE_COLUMN_INDEX, TABLE_ROW_DATA } from '../../table-cell-injection';
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

  // Extending constructor required with dateFormatter declaration above
  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) columnConfig: TableColumnConfigExtended,
    @Inject(TABLE_COLUMN_INDEX) index: number,
    @Inject(TABLE_CELL_DATA) cellData: Date | number,
    @Inject(TABLE_ROW_DATA) rowData: TableRow
  ) {
    super(columnConfig, index, cellData, rowData);
  }
}
