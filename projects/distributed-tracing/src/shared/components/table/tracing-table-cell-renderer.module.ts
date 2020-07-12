import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { IconModule, TableModule, TooltipModule } from '@hypertrace/components';
import { MetricTableCellRendererComponent } from './data-cell/metric/metric-table-cell-renderer.component';
import { TraceStatusTableCellRendererComponent } from './data-cell/trace-status/trace-status-table-cell-renderer.component';

@NgModule({
  declarations: [MetricTableCellRendererComponent, TraceStatusTableCellRendererComponent],
  imports: [
    CommonModule,
    TableModule.withCellRenderers([MetricTableCellRendererComponent, TraceStatusTableCellRendererComponent]),
    IconModule,
    TooltipModule,
    FormattingModule
  ]
})
export class TracingTableCellRendererModule {}
