import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  Injector,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FilterAttribute } from '../../../filter-bar/filter-attribute';
import { TableColumnConfigExtended, TableRow } from '../../table-api';
import { createInjector } from '../table-cell-injection';
import { TableCellAlignmentType } from '../types/table-cell-alignment-type';

@Component({
  selector: 'htc-table-data-cell-renderer',
  styleUrls: ['./table-data-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-data-cell-renderer" [class.selected]="this.popoverOpen">
      <ng-container *ngIf="this.columnConfig?.filterable && this.leftAlignFilterButton">
        <ng-container *ngTemplateOutlet="filterButton"></ng-container>
      </ng-container>
      <div class="cell-renderer-content" [ngClass]="this.alignment" (click)="this.onClick($event)">
        <ng-container #cellRenderer></ng-container>
      </div>
      <ng-container *ngIf="this.columnConfig?.filterable && !this.leftAlignFilterButton">
        <ng-container *ngTemplateOutlet="filterButton"></ng-container>
      </ng-container>

      <ng-template #filterButton>
        <htc-filter-button
          class="filter-button"
          [metadata]="this.metadata"
          [attribute]="this.columnConfig?.attribute"
          [value]="this.parseFilterValue()"
          (popoverOpen)="this.popoverOpen = $event"
        ></htc-filter-button>
      </ng-template>
    </div>
  `
})
export class TableDataCellRendererComponent implements OnInit {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public columnConfig?: TableColumnConfigExtended;

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

  public constructor(
    private readonly injector: Injector,
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
    this.cellRenderer.createComponent(
      this.componentFactoryResolver.resolveComponentFactory(this.columnConfig.renderer),
      0,
      createInjector(this.columnConfig, this.index, this.cellData, this.rowData, this.injector)
    );

    // Allow columnConfig to override default alignment for cell renderer
    this.alignment = this.columnConfig.alignment ?? this.columnConfig.renderer.alignment;
    this.leftAlignFilterButton = this.alignment === TableCellAlignmentType.Right;
  }

  public onClick(event: MouseEvent): void {
    if (this.columnConfig === undefined || this.rowData === undefined) {
      throw Error(`Undefined columnConfig or rowData`);
    }

    if (this.isClickHandlerDefined(this.columnConfig.onClick)) {
      this.columnConfig.onClick(this.rowData, this.columnConfig);
      event.stopPropagation();
    }
  }

  public parseFilterValue(): unknown {
    if (this.columnConfig === undefined || this.cellData === undefined) {
      throw Error(`Undefined columnConfig or cellData`);
    }

    return this.columnConfig.parser.parseFilterValue(this.cellData);
  }

  private isClickHandlerDefined(onClick: unknown): onClick is Function {
    return onClick !== undefined && onClick instanceof Function;
  }
}
