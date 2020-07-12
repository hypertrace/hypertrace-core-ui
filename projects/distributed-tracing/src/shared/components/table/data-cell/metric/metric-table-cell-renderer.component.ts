import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { Dictionary, FormatterStyle } from '@hypertrace/common';
import {
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA,
  TableCellAlignmentType,
  TableCellRenderer,
  TableCellRendererComponent,
  TableColumnConfig
} from '@hypertrace/components';
import { MetricAggregation } from '../../../../../shared/graphql/model/metrics/metric-aggregation';
import { TracingTableCellRenderer } from '../../tracing-table-cell-renderer';

@Component({
  selector: 'htc-metric-table-cell-renderer',
  styleUrls: ['./metric-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-cell" [htcTooltip]="this.value.tooltip">
      <!-- This displays as "<value> <unit>", e.g. 120 ms -->
      <span
        >{{ this.value.metric | htcDisplayNumber: this.formatter }}
        <span *ngIf="this.value.units">{{ this.value.units }}</span></span
      >
    </div>
  `
})
@TableCellRenderer({
  type: TracingTableCellRenderer.Metric,
  alignment: TableCellAlignmentType.Right
})
export class MetricTableCellRendererComponent extends TableCellRendererComponent<Raw, Parsed> {
  public readonly formatter: FormatterStyle = FormatterStyle.None;

  // Note: We have the constructor here as well due to some test weirdness triggered by the local property assignment
  public constructor(
    @Inject(TABLE_CELL_RENDERER_COLUMN_CONFIG) columnConfig: TableColumnConfig,
    @Inject(TABLE_CELL_RENDERER_COLUMN_INDEX) index: number,
    @Optional() @Inject(TABLE_CELL_RENDERER_CELL_DATA) cellData: Raw | null,
    @Optional() @Inject(TABLE_CELL_RENDERER_ROW_DATA) rowData: Dictionary<unknown> | null
  ) {
    super(columnConfig, index, cellData, rowData);
  }

  protected parseValue(raw: Raw): Parsed {
    const metric = Math.round(this.extractValue(raw)!);
    const units = this.extractUnits(raw);

    return {
      metric: metric,
      units: units,
      tooltip: `${metric} ${units !== undefined ? units : ''}`.trim()
    };
  }

  private extractValue(raw: Raw): number | undefined {
    switch (typeof raw) {
      case 'number':
        return raw;
      case 'object':
        return raw.value;
      default:
        return undefined;
    }
  }

  private extractUnits(valueHolder: Raw): string | undefined {
    switch (typeof valueHolder) {
      case 'number':
        return undefined;
      case 'object':
        return valueHolder.units;
      default:
        return undefined;
    }
  }
}

type Raw = number | Partial<MetricAggregation>;

interface Parsed {
  metric: number | undefined;
  units: string | undefined;
  tooltip: string;
}
