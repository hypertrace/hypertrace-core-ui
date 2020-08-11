import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellAlignmentType, TableCellRenderer, TableCellRendererComponent } from '@hypertrace/components';
import { TraceStatus } from '../../../../../shared/graphql/model/schema/trace';
import { TracingTableCellRenderer } from '../../tracing-table-cell-renderer';

@Component({
  selector: 'htc-status-table-cell-renderer',
  styleUrls: ['./trace-status-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="trace-status" [htcTooltip]="this.value.status" [ngClass]="{ clickable: this.clickable }">
      <div class="status" [ngClass]="this.value.status.toString().toLowerCase()">
        <span class="text">{{ this.value.statusCode }} - {{ this.value.statusMessage }}</span>
      </div>
    </div>
  `
})
@TableCellRenderer({
  type: TracingTableCellRenderer.TraceStatus,
  alignment: TableCellAlignmentType.Left
})
export class TraceStatusTableCellRendererComponent extends TableCellRendererComponent<TraceStatus> {
  protected parseValue(cellData: TraceStatus): TraceStatus {
    return cellData;
  }
}
