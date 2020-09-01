import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormatterStyle } from '@hypertrace/common';
import { TableCellAlignmentType, TableCellRenderer, TableCellRendererBase } from '@hypertrace/components';
import { MetricAggregation } from '../../../../../shared/graphql/model/metrics/metric-aggregation';
import { TracingTableCellType } from '../../tracing-table-cell-type';

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
  type: TracingTableCellType.Metric,
  alignment: TableCellAlignmentType.Right,
  parser: TracingTableCellType.Metric
})
export class MetricTableCellRendererComponent extends TableCellRendererBase<
  number | Partial<MetricAggregation>,
  number
> {
  public readonly formatter: FormatterStyle = FormatterStyle.None;
}
