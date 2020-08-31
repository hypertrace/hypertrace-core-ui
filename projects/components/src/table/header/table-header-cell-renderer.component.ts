import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-bar/filter-attribute';
import { TableCellRendererConstructor } from '../cells/table-cell-renderer';
import { TableCellRendererLookupService } from '../cells/table-cell-renderer-lookup.service';
import { TableCellAlignmentType } from '../cells/types/table-cell-alignment-type';
import { TableColumnConfig, TableSortDirection } from '../table-api';

@Component({
  selector: 'htc-table-header-cell-renderer',
  styleUrls: ['./table-header-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="this.columnConfig"
      [ngClass]="this.classes"
      [htcTooltip]="this.columnConfig.titleTooltip || this.columnConfig.title"
      class="table-header-cell-renderer"
    >
      <ng-container *ngIf="this.columnConfig?.filterAttribute && this.leftAlignFilterButton">
        <ng-container *ngTemplateOutlet="filterButton"></ng-container>
      </ng-container>
      <div class="title" [ngClass]="this.classes" (click)="this.sortChange.emit()">{{ this.columnConfig.title }}</div>
      <ng-container *ngIf="this.columnConfig?.filterAttribute && !this.leftAlignFilterButton">
        <ng-container *ngTemplateOutlet="filterButton"></ng-container>
      </ng-container>

      <ng-template #filterButton>
        <htc-in-filter-button
          class="filter-button"
          *ngIf="this.columnConfig?.filterAttribute && !this.leftAlignFilterButton"
          [metadata]="this.metadata"
          [attribute]="this.columnConfig.filterAttribute"
          [values]="this.values"
        ></htc-in-filter-button>
      </ng-template>
    </div>
  `
})
export class TableHeaderCellRendererComponent implements OnInit, OnChanges {
  @Input()
  public metadata?: FilterAttribute[];

  @Input()
  public columnConfig?: TableColumnConfig;

  @Input()
  public index?: number;

  @Input()
  public sort?: TableSortDirection;

  @Input()
  public values?: unknown[];

  @Output()
  public readonly sortChange: EventEmitter<void> = new EventEmitter();

  public alignment?: TableCellAlignmentType;
  public leftAlignFilterButton: boolean = false;
  public rendererConstructor?: TableCellRendererConstructor;
  public classes: string[] = [];

  public constructor(private readonly tableCellRendererService: TableCellRendererLookupService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.columnConfig || changes.sort) {
      this.classes = this.buildClasses();
    }
  }

  public ngOnInit(): void {
    if (this.columnConfig === undefined) {
      throw new Error('Table column config undefined');
    }

    if (this.index === undefined) {
      throw new Error('Table column index undefined');
    }

    this.rendererConstructor = this.tableCellRendererService.lookup(this.columnConfig.renderer);

    // Allow columnConfig to override default alignment for cell renderer
    this.alignment = this.columnConfig.alignment ?? this.rendererConstructor.alignment;
    this.leftAlignFilterButton = this.alignment === TableCellAlignmentType.Right;
    this.classes = this.buildClasses();
  }

  private buildClasses(): string[] {
    return [this.alignment, this.sort].filter(str => str !== undefined).map(str => (str as string).toLowerCase());
  }
}
