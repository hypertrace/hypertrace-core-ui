import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashboardPersistenceService } from '@hypertrace/dashboards';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { catchError, defaultIfEmpty, map } from 'rxjs/operators';
import { Filter } from '../../components/filter-bar/filter/filter-api';
import { GraphQlFilter } from '../../graphql/model/schema/filter/graphql-filter';
import { GraphQlFilterBuilderService } from '../../services/filter-builder/graphql-filter-builder.service';
import { GraphQlFilterDataSourceModel } from '../data/graphql/filter/graphql-filter-data-source.model';

@Component({
  selector: 'htc-navigable-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="this.filterConfig ? 'dashboard-container-content' : 'fill-container'">
      <htc-filter-bar
        *ngIf="this.showFilterBar"
        [scope]="this.filterConfig?.scope"
        [syncWithUrl]="true"
        (filtersChange)="this.onFilterChange($event)"
      >
      </htc-filter-bar>
      <htc-application-aware-dashboard
        *htcLoadAsync="this.dashboardJson$ as dashboardJson"
        class="dashboard-content"
        [json]="dashboardJson"
        (dashboardReady)="this.onDashboardReady($event)"
      >
      </htc-application-aware-dashboard>
    </div>
  `
})
export class NavigableDashboardComponent implements OnInit {
  @Input()
  public readonly defaultJson?: ModelJson;

  @Input()
  public navLocation!: string;

  @Input()
  public filterConfig?: NavigableDashboardFilterConfig;

  @Output()
  public readonly dashboardReady: EventEmitter<Dashboard> = new EventEmitter();

  public get showFilterBar(): boolean {
    return !!this.filterConfig && !this.filterConfig.hideFilterBar;
  }

  public dashboardJson$?: Observable<ModelJson>;
  private explicitFilters: Filter[] = [];
  private dashboard?: Dashboard;
  private get implicitFilters(): GraphQlFilter[] {
    return this.filterConfig?.implicitFilters ?? [];
  }

  public constructor(
    private readonly dashboardPersistenceService: DashboardPersistenceService,
    private readonly graphQlFilterBuilderService: GraphQlFilterBuilderService
  ) {}

  public ngOnInit(): void {
    this.dashboardJson$ = this.dashboardPersistenceService.getForLocation(this.navLocation).pipe(
      map(dashboard => dashboard.content),
      catchError(() => EMPTY),
      defaultIfEmpty(this.defaultJson)
    );
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.dashboard = dashboard;
    this.applyFiltersToDashboard(dashboard, this.explicitFilters);
    this.dashboardReady.emit(dashboard);
  }

  public onFilterChange(explicitFilters: Filter[]): void {
    this.explicitFilters = explicitFilters;
    if (this.dashboard) {
      this.applyFiltersToDashboard(this.dashboard, explicitFilters);
    }
  }

  public applyFiltersToDashboard(dashboard: Dashboard, explicitFilters: Filter[]): void {
    const rootDataSource = dashboard.getRootDataSource<GraphQlFilterDataSourceModel>();
    rootDataSource
      ?.clearFilters()
      .addFilters(...this.implicitFilters, ...this.graphQlFilterBuilderService.buildGraphQlFilters(explicitFilters));
    dashboard.refresh();
  }
}

export interface NavigableDashboardFilterConfig {
  scope: string;
  hideFilterBar?: boolean;
  implicitFilters?: GraphQlFilter[];
}
