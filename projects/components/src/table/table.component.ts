import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TableCdkDataSource } from './data/table-cdk-data-source';
import {
  ColumnConfigProvider,
  ColumnStateChangeProvider,
  FilterProvider,
  RowStateChangeProvider,
  TableDataSourceProvider
} from './data/table-cdk-data-source-api';
import { TableCdkRowUtil } from './data/table-cdk-row-util';
import { TableDataSource } from './data/table-data-source';
import { StandardTableCellRendererType } from './renderers/standard-table-cell-renderer-type';
import {
  StatefulTableRow,
  TableColumnConfig,
  TableMode,
  TableRow,
  TableSelectionMode,
  TableSortDirection,
  TableStyle
} from './table-api';

@Component({
  selector: 'htc-table',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Search -->
    <div *ngIf="this.searchable" class="table-controls">
      <htc-search-box class="search-box" (valueChange)="this.applyFilter($event)"></htc-search-box>
    </div>

    <!-- Table -->
    <cdk-table
      [multiTemplateDataRows]="this.isDetailType()"
      [dataSource]="this.dataSource"
      [ngClass]="this.display"
      class="table"
    >
      <!-- Columns -->
      <div *ngFor="let columnDef of this.columnConfigsSubject.value; index as index">
        <ng-container [cdkColumnDef]="columnDef.field">
          <cdk-header-cell
            *cdkHeaderCellDef
            [style.flex-basis]="columnDef.width"
            [style.max-width]="columnDef.width"
            class="header-cell"
          >
            <htc-table-header-cell-renderer
              [columnConfig]="columnDef"
              [index]="index"
              [sort]="columnDef.sort"
              (click)="this.onHeaderCellClick(columnDef)"
            >
            </htc-table-header-cell-renderer>
          </cdk-header-cell>
          <cdk-cell
            *cdkCellDef="let row"
            [style.flex-basis]="columnDef.width"
            [style.max-width]="columnDef.width"
            [style.margin-left]="this.indent(columnDef, row)"
            [ngClass]="{
              'child-row': this.isChildRow(row),
              'expander-column': this.isExpanderColumn(columnDef),
              'detail-expanded': this.isDetailExpanded(row)
            }"
            class="data-cell"
          >
            <htc-table-data-cell-renderer
              [columnConfig]="columnDef"
              [index]="this.columnIndex(columnDef, index)"
              [cellData]="row[columnDef.field]"
              [rowData]="row"
              (click)="this.onDataCellClick(columnDef, row)"
            ></htc-table-data-cell-renderer>
          </cdk-cell>
        </ng-container>
      </div>

      <!-- Expandable Detail Column -->
      <ng-container [cdkColumnDef]="this.expandedDetailColumnConfig.field" *ngIf="this.isDetailType()">
        <cdk-cell *cdkCellDef="let row" [attr.colspan]="this.columnConfigsSubject.value.length" class="expanded-cell">
          <htc-table-expanded-detail-row-cell-renderer
            *ngIf="this.isRowExpanded(row)"
            [row]="row"
            [expanded]="this.isRowExpanded(row)"
            [content]="this.detailContent"
          ></htc-table-expanded-detail-row-cell-renderer>
        </cdk-cell>
      </ng-container>

      <!-- Header Row -->
      <ng-container *ngIf="this.isShowHeader()">
        <cdk-header-row *cdkHeaderRowDef="this.visibleColumns()" class="header-row"></cdk-header-row>
      </ng-container>

      <!-- Data Rows -->
      <cdk-row
        *cdkRowDef="let row; columns: this.visibleColumns()"
        (mouseenter)="this.onDataRowMouseEnter(row)"
        (mouseleave)="this.onDataRowMouseLeave()"
        [ngClass]="{ 'selected-row': this.isSelectedRow(row), 'hovered-row': this.isHoveredRow(row) }"
        class="data-row"
      ></cdk-row>

      <!-- Expandable Detail Rows -->
      <ng-container *ngIf="this.isDetailType()">
        <cdk-row
          *cdkRowDef="let row; columns: [this.expandedDetailColumnConfig.field]"
          class="expandable-row"
        ></cdk-row>
      </ng-container>
    </cdk-table>

    <!-- State Watcher -->
    <div class="state-watcher">
      <ng-container class="state-watcher" *htcLoadAsync="this.dataSource?.loadingStateChange$ | async"></ng-container>
    </div>

    <!-- Pagination -->
    <div class="pagination-controls" *ngIf="this.pageable">
      <htc-paginator></htc-paginator>
    </div>
  `
})
export class TableComponent
  implements
    OnChanges,
    AfterViewInit,
    ColumnConfigProvider,
    TableDataSourceProvider,
    FilterProvider,
    ColumnStateChangeProvider,
    RowStateChangeProvider {
  private readonly expandableToggleColumnConfig: TableColumnConfig = {
    field: '$$state',
    width: '32px',
    visible: true,
    renderer: StandardTableCellRendererType.RowExpander,
    onClick: (row: StatefulTableRow) => this.toggleRowExpanded(row)
  };

  public readonly expandedDetailColumnConfig: TableColumnConfig = {
    field: '$$detail'
  };

  @Input()
  public columnConfigs?: TableColumnConfig[];

  @Input()
  public data?: TableDataSource<TableRow>;

  @Input()
  public mode?: TableMode = TableMode.Flat;

  @Input()
  public display?: TableStyle = TableStyle.Embedded;

  @Input()
  public selectionMode?: TableSelectionMode = TableSelectionMode.Single;

  @Input()
  public title?: string;

  @Input()
  public searchable?: boolean = false;

  @Input()
  public pageable?: boolean = true;

  @Input()
  public detailContent?: TemplateRef<{ row: StatefulTableRow }>;

  @Input()
  public initialExpandAll?: boolean = false;

  @Input()
  public selection?: StatefulTableRow;

  @Input()
  public hovered?: StatefulTableRow;

  @Output()
  public readonly selectionChange: EventEmitter<StatefulTableRow | undefined> = new EventEmitter<
    StatefulTableRow | undefined
  >();

  @Output()
  public readonly hoveredChange: EventEmitter<StatefulTableRow | undefined> = new EventEmitter<
    StatefulTableRow | undefined
  >();

  @Output()
  public readonly toggleRowChange: EventEmitter<StatefulTableRow> = new EventEmitter<StatefulTableRow>();

  @Output()
  public readonly toggleAllChange: EventEmitter<boolean> = new EventEmitter<boolean>(); // True: expand, False: collapse

  @ViewChild(PaginatorComponent)
  public paginator?: PaginatorComponent;

  public readonly columnConfigsSubject: BehaviorSubject<TableColumnConfig[]> = new BehaviorSubject<TableColumnConfig[]>(
    []
  );
  private readonly filterSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private readonly rowStateSubject: BehaviorSubject<StatefulTableRow | undefined> = new BehaviorSubject<
    StatefulTableRow | undefined
  >(undefined);
  private readonly columnStateSubject: BehaviorSubject<TableColumnConfig | undefined> = new BehaviorSubject<
    TableColumnConfig | undefined
  >(undefined);

  public readonly columnConfigs$: Observable<TableColumnConfig[]> = this.columnConfigsSubject.asObservable();
  public readonly filter$: Observable<string> = this.filterSubject.asObservable();
  public readonly rowState$: Observable<StatefulTableRow | undefined> = this.rowStateSubject.asObservable();
  public readonly columnState$: Observable<TableColumnConfig | undefined> = this.columnStateSubject.asObservable();

  public dataSource?: TableCdkDataSource;

  public constructor(private readonly changeDetector: ChangeDetectorRef) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.columnConfigs || changes.detailContent) {
      this.columnConfigsSubject.next(this.buildColumnConfigs());
    }

    if (this.dataSource && changes.data) {
      // The dataSource changes on refresh. Only reassign if already initialized (this.dataSource !== undefined)
      this.dataSource = this.buildDataSource();
    }
  }

  public ngAfterViewInit(): void {
    this.dataSource = this.buildDataSource();
    this.changeDetector.detectChanges();
  }

  public onHeaderCellClick(columnConfig: TableColumnConfig): void {
    this.toggleColumnSort(columnConfig);
  }

  public onDataCellClick(columnConfig: TableColumnConfig, row: StatefulTableRow): void {
    // NOTE: Cell Renderers generally handle their own clicks. We should only perform table actions here.
    if (this.isExpanderColumn(columnConfig)) {
      this.toggleRowExpanded(row);

      return;
    }

    columnConfig.onClick && columnConfig.onClick(row, columnConfig);

    // Propagate the cell click to the row
    /*
     * TODO: The reason we have this here is so that when the expander column is clicked it doesn't cause a
     *  row selection as well. The disadvantage is now the row selection only happens when clicking within the
     *  bounds of a cell, which is a smaller hit box due to row padding. Need to revisit.
     */
    this.onDataRowClick(row);
  }

  public onDataRowClick(row: StatefulTableRow): void {
    if (this.hasSelectableRows()) {
      this.toggleRowSelection(row);
    }
  }

  public onDataRowMouseEnter(row: StatefulTableRow): void {
    this.hovered = row;
    this.hoveredChange.emit(this.hovered);
  }

  public onDataRowMouseLeave(): void {
    this.hovered = undefined;
    this.hoveredChange.emit(this.hovered);
  }

  public indent(columnConfig: TableColumnConfig, row: StatefulTableRow): string {
    if (this.isExpanderColumn(columnConfig)) {
      return `${row.$$state.depth * 12}px`;
    }

    return '0';
  }

  public columnIndex(columnConfig: TableColumnConfig, index: number): number {
    if (this.isExpanderColumn(columnConfig)) {
      return 0;
    }

    return this.hasExpandableRows() ? index - 1 : index;
  }

  private buildColumnConfigs(): TableColumnConfig[] {
    if (!this.columnConfigs) {
      return [];
    }

    if (this.hasExpandableRows()) {
      return [this.expandableToggleColumnConfig, ...this.columnConfigs];
    }

    return this.columnConfigs;
  }

  private buildDataSource(): TableCdkDataSource | undefined {
    if (!this.data || !this.columnConfigs) {
      throw new Error('Undefined data or columnConfigs');
    }

    return new TableCdkDataSource(this, this, this, this, this, this.paginator);
  }

  public applyFilter(value: string): void {
    this.filterSubject.next(value);
  }

  public visibleColumns(): string[] {
    return this.columnConfigsSubject.value
      .filter(columnConfig => columnConfig.visible)
      .map(columnConfig => columnConfig.field);
  }

  private toggleColumnSort(columnConfig: TableColumnConfig): void {
    // Order: undefined -> Ascending -> Descending -> undefined
    switch (columnConfig.sort) {
      case TableSortDirection.Ascending:
        columnConfig.sort = TableSortDirection.Descending;
        break;
      case TableSortDirection.Descending:
        columnConfig.sort = undefined;
        break;
      default:
        columnConfig.sort = TableSortDirection.Ascending;
    }
    this.columnStateSubject.next(columnConfig);
  }

  public toggleRowSelection(row: StatefulTableRow): void {
    this.selection = this.selection === row ? undefined : row;
    this.selectionChange.emit(this.selection);
    this.changeDetector.markForCheck();
  }

  public toggleRowExpanded(row: StatefulTableRow): void {
    row.$$state.expanded = !row.$$state.expanded;
    this.rowStateSubject.next(row);
    this.toggleRowChange.emit(row);
    this.changeDetector.markForCheck();
  }

  public expandAllRows(): void {
    if (this.dataSource) {
      this.dataSource.expandAllRows();
      this.toggleAllChange.emit(true);
      this.changeDetector.markForCheck();
    }
  }

  public collapseAllRows(): void {
    if (this.dataSource) {
      this.dataSource.collapseAllRows();
      this.toggleAllChange.emit(false);
      this.changeDetector.markForCheck();
    }
  }

  public isExpanderColumn(columnConfig: TableColumnConfig): boolean {
    return columnConfig === this.expandableToggleColumnConfig;
  }

  public isSelectedRow(row: StatefulTableRow): boolean {
    return this.selection !== undefined && TableCdkRowUtil.isEqualExceptState(row, this.selection);
  }

  public isHoveredRow(row: StatefulTableRow): boolean {
    return this.hovered !== undefined && TableCdkRowUtil.isEqualExceptState(row, this.hovered);
  }

  public isChildRow(row: StatefulTableRow): boolean {
    return !!row.$$state.parent;
  }

  public isDetailType(): boolean {
    return this.mode === TableMode.Detail;
  }

  public isTreeType(): boolean {
    return this.mode === TableMode.Tree;
  }

  public isShowHeader(): boolean {
    return this.display !== TableStyle.List;
  }

  public hasExpandableRows(): boolean {
    return this.isDetailType() || this.isTreeType();
  }

  public isDetailExpanded(row: StatefulTableRow): boolean {
    return this.isDetailType() && row.$$state.expanded;
  }

  public hasSelectableRows(): boolean {
    return this.selectionMode === TableSelectionMode.Single;
  }

  public isRowExpanded(row: StatefulTableRow): boolean {
    return this.hasExpandableRows() && row.$$state.expanded;
  }
}
