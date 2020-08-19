import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FilterAttribute } from '../../../filter-bar/filter-attribute';
import { TableColumnConfig, TableRow } from '../../table-api';
import { TableCellAlignmentType } from '../table-cell-alignment-type';
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
        *ngIf="this.columnConfig?.filterAttribute && this.leftAlignFilterButton"
        [metadata]="this.metadata"
        [attribute]="this.columnConfig?.filterAttribute"
        [value]="this.parseValue()"
        (popoverOpen)="this.popoverOpen = $event"
      ></htc-filter-button>
      <div class="cell-renderer-content" [ngClass]="this.alignment" (click)="this.onClick()">
        <div #cellRenderer></div>
      </div>
      <htc-filter-button
        class="filter-button"
        *ngIf="this.columnConfig?.filterAttribute && !this.leftAlignFilterButton"
        [metadata]="this.metadata"
        [attribute]="this.columnConfig?.filterAttribute"
        [value]="this.parseValue()"
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

  @ViewChild('cellRenderer', { read: ViewContainerRef, static: true })
  public cellRenderer!: ViewContainerRef;

  public alignment?: TableCellAlignmentType;
  public leftAlignFilterButton: boolean = false;
  public popoverOpen: boolean = false;

  private componentRef?: ComponentRef<TableCellRendererComponent<unknown, unknown>>;

  public constructor(
    private readonly injector: Injector,
    private readonly tableCellRendererService: TableCellRendererService,
    private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {}

  public ngOnInit(): void {
    if (this.columnConfig === undefined) {
      throw new Error('Table column config undefined');
    }

    if (this.index === undefined) {
      throw new Error(`Table column index undefined for field '${this.columnConfig.field}'`);
    }

    if (this.rowData === undefined) {
      throw new Error(`Table row undefined for field '${this.columnConfig.field}'`);
    }

    // Dynamic Component Setup
    const tableCellRendererConstructor = this.tableCellRendererService.lookup(this.columnConfig.renderer);

    this.componentRef = this.cellRenderer.createComponent(
      this.componentFactoryResolver.resolveComponentFactory(tableCellRendererConstructor),
      0,
      this.tableCellRendererService.createInjector(
        this.columnConfig,
        this.index,
        this.cellData,
        this.rowData,
        this.injector
      )
    );

    // Allow columnConfig to override default alignment for cell renderer
    this.alignment = this.columnConfig.alignment ?? tableCellRendererConstructor.alignment;
    this.leftAlignFilterButton = this.alignment === TableCellAlignmentType.Right;
  }

  public onClick(): void {
    this.columnConfig && this.columnConfig.onClick && this.columnConfig.onClick(this.rowData!, this.columnConfig);
  }

  public parseValue(): unknown {
    return this.componentRef?.instance.parseValue(this.cellData, this.rowData);
  }
}
