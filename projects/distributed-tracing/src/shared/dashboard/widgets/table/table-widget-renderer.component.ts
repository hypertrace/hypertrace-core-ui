import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { TableColumnConfig, TableDataSource, TableRow } from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RENDERER_API, RendererApi } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { TableWidgetModel } from './table-widget.model';

@Renderer({ modelClass: TableWidgetModel })
@Component({
  selector: 'htc-table-widget-renderer',
  styleUrls: ['./table-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-titled-content
      [title]="this.model.header?.title | htcDisplayTitle"
      [link]="this.model.header?.link?.url"
      [linkLabel]="this.model.header?.link?.displayText"
      class="table-widget-container"
    >
      <htc-table
        class="table"
        [ngClass]="{ 'with-header': this.model.header }"
        [columnConfigs]="this.columnDefs"
        [mode]="this.model.mode"
        [display]="this.model.style"
        [data]="this.data$ | async"
        [searchable]="this.api.model.searchable"
        [pageable]="this.api.model.pageable"
        [detailContent]="childDetail"
      >
      </htc-table>
    </htc-titled-content>
    <ng-template #childDetail let-row="row">
      <ng-container [hdaDashboardModel]="this.getChildModel | htcMemoize: row"> </ng-container>
    </ng-template>
  `
})
export class TableWidgetRendererComponent
  extends WidgetRenderer<TableWidgetModel, TableDataSource<TableRow> | undefined>
  implements OnInit {
  public columnDefs: TableColumnConfig[];

  public constructor(@Inject(RENDERER_API) api: RendererApi<TableWidgetModel>, changeDetector: ChangeDetectorRef) {
    super(api, changeDetector);

    this.columnDefs = this.model.getColumns();
  }

  public getChildModel = (row: TableRow): object | undefined => this.model.getChildModel(row);

  protected fetchData(): Observable<TableDataSource<TableRow> | undefined> {
    return this.model.getData().pipe(startWith(undefined));
  }
}
