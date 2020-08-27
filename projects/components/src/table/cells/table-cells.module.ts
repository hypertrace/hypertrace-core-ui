import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Inject, InjectionToken, NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
import { ExpanderToggleModule } from '../../expander/expander-toggle.module';
import { FilterButtonModule } from '../../filter-button/filter-button.module';
import { IconModule } from '../../icon/icon.module';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { TableHeaderCellRendererComponent } from '../header/table-header-cell-renderer.component';
import { IconTableCellRendererComponent } from './data/icon/icon-table-cell-renderer.component';
import { NumericTableCellRendererComponent } from './data/numeric/numeric-table-cell-renderer.component';
import { TableDataCellRendererComponent } from './data/table-data-cell-renderer.component';
import { TextTableCellRendererComponent } from './data/text/text-table-cell-renderer.component';
import { TimestampTableCellRendererComponent } from './data/timestamp/timestamp-table-cell-renderer.component';
import { TableCheckboxCellRendererComponent } from './state/checkbox/table-checkbox-cell-renderer.component';
import { TableExpandedDetailRowCellRendererComponent } from './state/expanded-detail/table-expanded-detail-row-cell-renderer.component';
import { TableExpanderCellRendererComponent } from './state/expander/table-expander-cell-renderer.component';
import { TableCellRendererConstructor } from './table-cell-renderer';
import { TableCellRendererLookupService } from './table-cell-renderer-lookup.service';

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
export class TableCellsModule {
  public constructor(
    private readonly tableCellRendererService: TableCellRendererLookupService,
    @Inject(TABLE_CELL_RENDERERS) cellRenderers: TableCellRendererConstructor[][]
  ) {
    this.registerAllRenderers(cellRenderers.flat());
  }

  private registerAllRenderers(cellRenderers: TableCellRendererConstructor[] = []): void {
    this.tableCellRendererService.registerAll(cellRenderers, TextTableCellRendererComponent);
  }
}
