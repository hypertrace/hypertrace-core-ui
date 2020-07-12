import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { DateFormatMode, DateFormatOptions, Dictionary } from '@hypertrace/common';
import { TableColumnConfig } from '../../../table-api';
import { StandardTableCellRendererType } from '../../standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../table-cell-alignment-type';
import {
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA,
  TableCellRenderer
} from '../../table-cell-renderer';
import { TableCellRendererComponent } from '../../table-cell-renderer.component';

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
  type: StandardTableCellRendererType.Timestamp,
  alignment: TableCellAlignmentType.Right
})
export class TimestampTableCellRendererComponent extends TableCellRendererComponent<Value> {
  public readonly dateFormat: DateFormatOptions = {
    mode: DateFormatMode.DateAndTimeWithSeconds
  };

  // Note: We have the constructor here as well due to some test weirdness triggered by the local property assignment
  public constructor(
    @Inject(TABLE_CELL_RENDERER_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_CELL_RENDERER_COLUMN_INDEX) index: number,
    @Optional() @Inject(TABLE_CELL_RENDERER_CELL_DATA) cellData: Value | null,
    @Optional() @Inject(TABLE_CELL_RENDERER_ROW_DATA) rowData: Dictionary<unknown> | null
  ) {
    super(columnConfig, index, cellData, rowData);
  }

  protected parseValue(raw: Value): Value {
    return raw;
  }
}

type Value = Date | number;
