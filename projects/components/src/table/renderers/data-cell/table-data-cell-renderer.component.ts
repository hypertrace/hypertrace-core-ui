import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { TableColumnConfig } from '../../table-api';
import { TableCellAlignmentType } from '../table-cell-alignment-type';
import { TableCellRendererConstructor } from '../table-cell-renderer';
import { TableCellRendererService } from '../table-cell-renderer.service';

@Component({
  selector: 'htc-table-data-cell-renderer',
  styleUrls: ['./table-data-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-alignment-container">
      <div class="horizontal-alignment-container" [ngClass]="this.alignment">
        <ng-container *ngComponentOutlet="this.rendererConstructor; injector: this.rendererInjector"></ng-container>
      </div>
    </div>
  `
})
export class TableDataCellRendererComponent implements OnInit {
  @Input()
  public columnConfig?: TableColumnConfig;

  @Input()
  public index?: number;

  @Input()
  public cellData?: unknown;

  @Input()
  public rowData?: Dictionary<unknown>;

  public alignment?: TableCellAlignmentType;

  public rendererConstructor?: TableCellRendererConstructor;
  public rendererInjector?: Injector;

  public constructor(
    private readonly injector: Injector,
    private readonly tableCellRendererService: TableCellRendererService
  ) {}

  public ngOnInit(): void {
    if (this.columnConfig === undefined) {
      throw new Error('Table column config undefined');
    }

    if (this.index === undefined) {
      throw new Error(`Table column index undefined for field '${this.columnConfig.field}'`);
    }

    this.rendererConstructor = this.tableCellRendererService.lookup(this.columnConfig.renderer);
    this.rendererInjector = this.tableCellRendererService.createInjector(
      this.columnConfig,
      this.index,
      this.cellData,
      this.rowData,
      this.injector
    );

    // Allow columnConfig to override default alignment for cell renderer
    this.alignment = this.columnConfig.alignment ?? this.rendererConstructor.alignment;
  }
}
