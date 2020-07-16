import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StandardTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';

import { Observable } from 'rxjs';
import { Filter } from '../../shared/components/filter-bar/filter/filter-api';
import { TracingTableCellRenderer } from '../../shared/components/table/tracing-table-cell-renderer';
import { NavigableDashboardFilterConfig } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { GraphQlFilterDataSourceModel } from '../../shared/dashboard/data/graphql/filter/graphql-filter-data-source.model';
import { AttributeMetadata } from '../../shared/graphql/model/metadata/attribute-metadata';
import { GraphQlFilterBuilderService } from '../../shared/services/filter-builder/graphql-filter-builder.service';
import { MetadataService } from '../../shared/services/metadata/metadata.service';

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
export class SpanListPageComponent implements OnInit {
  public readonly location: string = 'SPANS';
  public readonly scope: string = 'SPAN';

  public readonly filterConfig: NavigableDashboardFilterConfig = {
    scope: this.scope
  };

  public attributes$!: Observable<AttributeMetadata[]>;
  private currentFilters: Filter[] = [];
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

  public constructor(
    private readonly graphQlFilterBuilderService: GraphQlFilterBuilderService,
    private readonly metadataService: MetadataService
  ) {}

  public ngOnInit(): void {
    this.attributes$ = this.metadataService.getFilterAttributes(this.scope);
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.dashboard = dashboard;
    this.updateFilters(dashboard, this.currentFilters);
  }

  public onFilterChange(filters: Filter[]): void {
    this.currentFilters = filters;
    if (this.dashboard) {
      this.updateFilters(this.dashboard, filters);
    }
  }

  private updateFilters(dashboard: Dashboard, filters: Filter[]): void {
    const graphqlFilters = this.graphQlFilterBuilderService.buildGraphQlFilters(filters);
    dashboard
      .getRootDataSource<GraphQlFilterDataSourceModel>()
      ?.clearFilters()
      .addFilters(...graphqlFilters);

    dashboard.refresh();
  }
}
