import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { PaginatorModule } from '../paginator/paginator.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { TableCellRendererConstructor } from './renderers/table-cell-renderer';
import { TableCellRendererModule, TABLE_CELL_RENDERERS } from './renderers/table-cell-renderer.module';
import { TableComponent } from './table.component';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    IconModule,
    TooltipModule,
    TableCellRendererModule,
    PaginatorModule,
    TraceSearchBoxModule,
    LoadAsyncModule
  ],
  declarations: [TableComponent],
  exports: [TableComponent]
})
// tslint:disable-next-line: no-unnecessary-class
export class TableModule {
  public static withCellRenderers(cellRenderers: TableCellRendererConstructor[]): ModuleWithProviders<TableModule> {
    return {
      ngModule: TableModule,
      providers: [
        {
          provide: TABLE_CELL_RENDERERS,
          useValue: cellRenderers,
          multi: true
        }
      ]
    };
  }
}
