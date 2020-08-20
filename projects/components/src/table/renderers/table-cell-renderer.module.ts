import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Inject, InjectionToken, NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
import { ExpanderToggleModule } from '../../expander/expander-toggle.module';
import { FilterButtonModule } from '../../filter-button/filter-button.module';
import { IconModule } from '../../icon/icon.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { TableCheckboxCellRendererComponent } from './checkbox-cell/table-checkbox-cell-renderer.component';
import { IconTableCellRendererComponent } from './data-cell/icon/icon-table-cell-renderer.component';
import { NumericTableCellRendererComponent } from './data-cell/numeric/numeric-table-cell-renderer.component';
import { TableDataCellRendererComponent } from './data-cell/table-data-cell-renderer.component';
import { TextTableCellRendererComponent } from './data-cell/text/text-table-cell-renderer.component';
import { TimestampTableCellRendererComponent } from './data-cell/timestamp/timestamp-table-cell-renderer.component';
import { TableExpandedDetailRowCellRendererComponent } from './expanded-detail/table-expanded-detail-row-cell-renderer.component';
import { TableExpanderCellRendererComponent } from './expander-cell/table-expander-cell-renderer.component';
import { TableHeaderCellRendererComponent } from './header-cell/table-header-cell-renderer.component';
import { TableCellRendererConstructor } from './table-cell-renderer';
import { TableCellRendererService } from './table-cell-renderer.service';

export const TABLE_CELL_RENDERERS = new InjectionToken<unknown[][]>('TABLE_CELL_RENDERERS');

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    ExpanderToggleModule,
    FormattingModule,
    IconModule,
    TooltipModule,
    TraceCheckboxModule,
    FilterButtonModule
  ],
  exports: [
    TableHeaderCellRendererComponent,
    TableDataCellRendererComponent,
    TableExpandedDetailRowCellRendererComponent
  ],
  declarations: [
    IconTableCellRendererComponent,
    NumericTableCellRendererComponent,
    TableCheckboxCellRendererComponent,
    TableDataCellRendererComponent,
    TableExpandedDetailRowCellRendererComponent,
    TableExpanderCellRendererComponent,
    TableHeaderCellRendererComponent,
    TextTableCellRendererComponent,
    TimestampTableCellRendererComponent
  ],
  providers: [
    {
      provide: TABLE_CELL_RENDERERS,
      useValue: [
        IconTableCellRendererComponent,
        NumericTableCellRendererComponent,
        TableCheckboxCellRendererComponent,
        TableExpanderCellRendererComponent,
        TextTableCellRendererComponent,
        TimestampTableCellRendererComponent
      ],
      multi: true
    }
  ]
})
export class TableCellRendererModule {
  public constructor(
    private readonly tableCellRendererService: TableCellRendererService,
    @Inject(TABLE_CELL_RENDERERS) cellRenderers: TableCellRendererConstructor[][]
  ) {
    this.registerAllRenderers(cellRenderers.flat());
  }

  private registerAllRenderers(cellRenderers: TableCellRendererConstructor[] = []): void {
    this.tableCellRendererService.registerAll(cellRenderers, TextTableCellRendererComponent);
  }
}
