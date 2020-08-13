import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DateFormatMode, DateFormatOptions } from '@hypertrace/common';
import { TableColumnConfig, TableRow } from '../../../table-api';
import { StandardTableCellRendererType } from '../../standard-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../table-cell-alignment-type';
import {
  TableCellRenderer,
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
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
export class TimestampTableCellRendererComponent extends TableCellRendererComponent<CellData> {
  public readonly dateFormat: DateFormatOptions = {
    mode: DateFormatMode.DateAndTimeWithSeconds
  };

  // Note: We have the constructor here as well due to some test weirdness triggered by the local property assignment
  public constructor(
    @Inject(TABLE_CELL_RENDERER_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_CELL_RENDERER_COLUMN_INDEX) index: number,
    @Inject(TABLE_CELL_RENDERER_ROW_DATA) rowData: TableRow,
    @Inject(TABLE_CELL_RENDERER_CELL_DATA) cellData: CellData
  ) {
    super(columnConfig, index, rowData, cellData);
  }

  public parseValue(cellData: CellData): CellData {
    return cellData;
  }
}

type CellData = Date | number;
