import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormatterStyle } from '@hypertrace/common';
import {
  TableCellAlignmentType,
  TableCellRenderer,
  TableCellRendererComponent,
  TableColumnConfig,
  TableRow,
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from '@hypertrace/components';
import { MetricAggregation } from '../../../../../shared/graphql/model/metrics/metric-aggregation';
import { TracingTableCellRenderer } from '../../tracing-table-cell-renderer';

@Component({
  selector: 'htc-metric-table-cell-renderer',
  styleUrls: ['./metric-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-cell" [htcTooltip]="this.tooltip">
      <!-- This displays as "<value> <unit>", e.g. 120 ms -->
      <span
        >{{ this.value | htcDisplayNumber: this.formatter }} <span *ngIf="this.units">{{ this.units }}</span></span
      >
    </div>
  `
})
@TableCellRenderer({
  type: TracingTableCellRenderer.Metric,
  alignment: TableCellAlignmentType.Right
})
export class MetricTableCellRendererComponent extends TableCellRendererComponent<CellData, number> {
  public readonly formatter: FormatterStyle = FormatterStyle.None;

  // Note: We have the constructor here as well due to some test weirdness triggered by the local property assignment
  public constructor(
    @Inject(TABLE_CELL_RENDERER_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_CELL_RENDERER_COLUMN_INDEX) index: number,
    @Inject(TABLE_CELL_RENDERER_ROW_DATA) rowData: TableRow,
    @Inject(TABLE_CELL_RENDERER_CELL_DATA) cellData: CellData
  ) {
    super(columnConfig, index, rowData, cellData);
  }

  public parseValue(cellData: CellData): number {
    return Math.round(this.extractValue(cellData)!);
  }

  protected parseUnits(cellData: CellData): string {
    return this.extractUnits(cellData)!;
  }

  private extractValue(cellData: CellData): number | undefined {
    switch (typeof cellData) {
      case 'number':
        return cellData;
      case 'object':
        return cellData.value;
      default:
        return undefined;
    }
  }

  private extractUnits(cellData: CellData): string | undefined {
    switch (typeof cellData) {
      case 'number':
        return undefined;
      case 'object':
        return cellData.units;
      default:
        return undefined;
    }
  }
}

type CellData = number | Partial<MetricAggregation>;
