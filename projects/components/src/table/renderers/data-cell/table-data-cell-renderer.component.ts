import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  Input,
  OnInit
} from '@angular/core';
import { FilterAttribute } from '../../../filter-bar/filter-attribute';
import { TableColumnConfig, TableRow } from '../../table-api';
import { TableCellAlignmentType } from '../table-cell-alignment-type';
import { TableCellRendererConstructor } from '../table-cell-renderer';
import { TableCellRendererComponent } from '../table-cell-renderer.component';
import { TableCellRendererService } from '../table-cell-renderer.service';

@Component({
  selector: 'htc-table-data-cell-renderer',
  styleUrls: ['./table-data-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-data-cell-renderer" [class.selected]="this.popoverOpen">
      <htc-filter-button
        class="filter-button"
        *ngIf="this.columnConfig?.filterable && this.leftAlignFilterButton"
        [metadata]="this.metadata"
        [attribute]="this.columnConfig?.attribute"
        [value]="this.componentRef?.instance.value"
        (popoverOpen)="this.popoverOpen = $event"
      ></htc-filter-button>
      <div class="cell-renderer-content" [ngClass]="this.alignment">
        <ng-container *ngComponentOutlet="this.rendererConstructor; injector: this.rendererInjector"></ng-container>
      </div>
      <htc-filter-button
        class="filter-button"
        *ngIf="this.columnConfig?.filterable && !this.leftAlignFilterButton"
        [metadata]="this.metadata"
        [attribute]="this.columnConfig?.attribute"
        [value]="this.componentRef?.instance.value"
        (popoverOpen)="this.popoverOpen = $event"
      ></htc-filter-button>
    </div>
  `
})
export class TableDataCellRendererComponent implements OnInit {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public columnConfig?: TableColumnConfig;

  @Input()
  public index?: number;

  @Input()
  public rowData?: TableRow;

  @Input()
  public cellData?: unknown;

  public alignment?: TableCellAlignmentType;
  public leftAlignFilterButton: boolean = false;
  public popoverOpen: boolean = false;

  public rendererConstructor?: TableCellRendererConstructor;
  public rendererInjector?: Injector;
  public componentRef?: ComponentRef<TableCellRendererComponent<unknown, unknown>>;

  public constructor(
    private readonly injector: Injector,
    private readonly tableCellRendererService: TableCellRendererService,
    private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {}

  public ngOnInit(): void {
    if (this.columnConfig === undefined) {
      throw new Error('Table column config undefined');
    }

    if (this.columnConfig.filterable && !this.columnConfig.attribute) {
      throw new Error(`Table attribute required to enable filtering for field '${this.columnConfig.field}'`);
    }

    if (this.index === undefined) {
      throw new Error(`Table column index undefined for field '${this.columnConfig.field}'`);
    }

    if (this.rowData === undefined) {
      throw new Error(`Table row undefined for field '${this.columnConfig.field}'`);
    }

    // Dynamic Component Setup
    this.rendererConstructor = this.tableCellRendererService.lookup(this.columnConfig.renderer);
    this.rendererInjector = this.tableCellRendererService.createInjector(
      this.columnConfig,
      this.index,
      this.cellData,
      this.rowData,
      this.injector
    );

    // Use cell renderer to initialize value for filtering
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(this.rendererConstructor)
      .create(this.rendererInjector);
    this.componentRef.instance.initialize();

    // Allow columnConfig to override default alignment for cell renderer
    this.alignment = this.columnConfig.alignment ?? this.rendererConstructor.alignment;
    this.leftAlignFilterButton = this.alignment === TableCellAlignmentType.Right;
  }
}
