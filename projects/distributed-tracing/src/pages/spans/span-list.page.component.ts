import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StandardTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';

import { TracingTableCellRenderer } from '../../shared/components/table/tracing-table-cell-renderer';
import { NavigableDashboardFilterConfig } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { SPAN_SCOPE } from '../../shared/graphql/model/schema/span';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-navigable-dashboard
      [navLocation]="this.location"
      [defaultJson]="this.defaultJson"
      [filterConfig]="this.filterConfig"
      (dashboardReady)="this.onDashboardReady($event)"
    >
    </htc-navigable-dashboard>
  `
})
export class SpanListPageComponent {
  public readonly location: string = 'SPANS';

  public readonly filterConfig: NavigableDashboardFilterConfig = {
    scope: SPAN_SCOPE
  };

  public dashboard?: Dashboard;

  public readonly defaultJson: ModelJson = {
    type: 'table-widget',
    style: TableStyle.FullPage,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Name',
        width: '50%',
        value: {
          type: 'attribute-specification',
          attribute: 'displaySpanName'
        },
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Status',
        width: '20%', // Use Status Cell Renderer
        value: {
          type: 'attribute-specification',
          attribute: 'statusCode'
        },
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Latency',
        width: '10%',
        display: TracingTableCellRenderer.Metric,
        value: {
          type: 'attribute-specification',
          attribute: 'duration'
        },
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Timestamp',
        width: '20%',
        display: StandardTableCellRendererType.Timestamp,
        value: {
          type: 'attribute-specification',
          attribute: 'startTime'
        },
        sort: TableSortDirection.Descending,
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'TraceId',
        width: '10%',
        visible: false,
        value: {
          type: 'attribute-specification',
          attribute: 'traceId'
        }
      }
    ],
    mode: TableMode.Detail,
    'child-template': {
      type: 'span-detail-widget',
      data: {
        type: 'span-detail-data-source',
        // tslint:disable-next-line: no-invalid-template-strings
        span: '${row}'
      }
    },
    data: {
      type: 'spans-table-data-source'
    }
  };

  public onDashboardReady(dashboard: Dashboard): void {
    this.dashboard = dashboard;
  }

}
