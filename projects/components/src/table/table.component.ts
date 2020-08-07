import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { isEqualIgnoreFunctions, NavigationService, NumberCoercer, TypedSimpleChanges } from '@hypertrace/common';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PageEvent } from '../paginator/page.event';
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

// tslint:disable max-file-line-count
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
        [ngClass]="{ 'selected-row': this.shouldHighlightRowAsSelection(row), 'hovered-row': this.isHoveredRow(row) }"
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
      <htc-paginator
        *htcLetAsync="this.urlPageData$ as pageData"
        (pageChange)="this.onPageChange($event)"
        [pageSize]="pageData?.pageSize"
        [pageIndex]="pageData?.pageIndex"
      ></htc-paginator>
    </div>
  `
})
export class TableComponent
  implements
    OnChanges,
    AfterViewInit,
    OnDestroy,
    ColumnConfigProvider,
    TableDataSourceProvider,
    FilterProvider,
    ColumnStateChangeProvider,
    RowStateChangeProvider {
  private static readonly PAGE_INDEX_URL_PARAM: string = 'page';
  private static readonly PAGE_SIZE_URL_PARAM: string = 'page-size';
  private static readonly SORT_COLUMN_URL_PARAM: string = 'sort-by';
  private static readonly SORT_DIRECTION_URL_PARAM: string = 'sort-direction';
  private readonly expandableToggleColumnConfig: TableColumnConfig = {
    field: '$$state',
    width: '32px',
    visible: true,
    renderer: StandardTableCellRendererType.RowExpander,
    onClick: (row: StatefulTableRow) => this.toggleRowExpanded(row)
  };

  private readonly multiSelectRowColumnConfig: TableColumnConfig = {
    field: '$$state',
    width: '32px',
    visible: true,
    renderer: StandardTableCellRendererType.Checkbox,
    onClick: (row: StatefulTableRow) => this.toggleRowSelected(row)
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
  public selections?: StatefulTableRow[] = [];

  @Input()
  public hovered?: StatefulTableRow;

  @Input()
  public syncWithUrl?: boolean = false;

  @Output()
  public readonly selectionsChange: EventEmitter<StatefulTableRow[]> = new EventEmitter<StatefulTableRow[]>();

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
  private rowSelections: StatefulTableRow[] = [];

  public readonly columnConfigs$: Observable<TableColumnConfig[]> = this.columnConfigsSubject.asObservable();
  public readonly filter$: Observable<string> = this.filterSubject.asObservable();
  public readonly rowState$: Observable<StatefulTableRow | undefined> = this.rowStateSubject.asObservable();
  public readonly columnState$: Observable<TableColumnConfig | undefined> = this.columnStateSubject.asObservable();
  public readonly urlPageData$: Observable<Partial<PageEvent> | undefined> = this.activatedRoute.queryParamMap.pipe(
    map(params => this.pageDataFromUrl(params))
  );

  public dataSource?: TableCdkDataSource;

  public constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    combineLatest([this.activatedRoute.queryParamMap, this.columnConfigs$])
      .pipe(
        map(([queryParamMap, columns]) => this.sortDataFromUrl(queryParamMap, columns)),
        filter((sort): sort is Required<SortedColumn> => sort !== undefined)
      )
      .subscribe(sort => this.updateSort(sort));
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.columnConfigs || changes.detailContent) {
      this.columnConfigsSubject.next(this.buildColumnConfigs());
    }

    if (changes.selections) {
      // Unselect all the rows and only check the latest selected ones
      this.dataSource?.unselectAllRows();
      this.selections?.forEach(row => {
        row.$$state.selected = true;
        this.rowStateSubject.next(row);
      });
      this.rowSelections = [...(this.selections ?? [])];
      this.changeDetector.markForCheck();
    }

    if (this.dataSource && changes.data) {
      // The dataSource changes on refresh. Only reassign if already initialized (this.dataSource !== undefined)
      this.rowStateSubject.next(undefined);
      this.dataSource = this.buildDataSource();
    }
  }

  public ngAfterViewInit(): void {
    this.dataSource = this.buildDataSource();
    this.changeDetector.detectChanges();
  }

  public ngOnDestroy(): void {
    this.filterSubject.complete();
    this.rowStateSubject.complete();
    this.columnStateSubject.complete();
    this.columnConfigsSubject.complete();
  }

  public onHeaderCellClick(columnConfig: TableColumnConfig): void {
    this.updateSort({
      column: columnConfig,
      direction: this.getNextSortDirection(columnConfig.sort)
    });

    if (this.syncWithUrl) {
      this.navigationService.addQueryParametersToUrl({
        [TableComponent.SORT_COLUMN_URL_PARAM]: columnConfig.sort === undefined ? undefined : columnConfig.field,
        [TableComponent.SORT_DIRECTION_URL_PARAM]: columnConfig.sort
      });
    }
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
      this.toggleRowSelected(row);
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

    if (this.hasMultiSelect()) {
      return [this.multiSelectRowColumnConfig, ...this.columnConfigs];
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

  private updateSort(sort: SortedColumn): void {
    sort.column.sort = sort.direction;
    this.columnStateSubject.next(sort.column);
  }

  public toggleRowSelected(row: StatefulTableRow): void {
    const rowIndexInSelections = this.rowSelections.findIndex(selection => isEqualIgnoreFunctions(selection, row));
    rowIndexInSelections >= 0 ? this.rowSelections.splice(rowIndexInSelections, 1) : this.rowSelections.push(row);
    this.selectionsChange.emit([...this.rowSelections]);
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

  public shouldHighlightRowAsSelection(row: StatefulTableRow): boolean {
    return (
      this.selectionMode !== TableSelectionMode.Multiple &&
      this.selections !== undefined &&
      this.selections.includes(row)
    );
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

  public hasMultiSelect(): boolean {
    return this.selectionMode === TableSelectionMode.Multiple;
  }

  public isRowExpanded(row: StatefulTableRow): boolean {
    return this.hasExpandableRows() && row.$$state.expanded;
  }

  public onPageChange(pageEvent: PageEvent): void {
    if (this.syncWithUrl) {
      this.navigationService.addQueryParametersToUrl({
        [TableComponent.PAGE_INDEX_URL_PARAM]: pageEvent.pageIndex,
        [TableComponent.PAGE_SIZE_URL_PARAM]: pageEvent.pageSize
      });
    }
  }

  private getNextSortDirection(sortDirection?: TableSortDirection): TableSortDirection | undefined {
    // Order: undefined -> Ascending -> Descending -> undefined
    switch (sortDirection) {
      case TableSortDirection.Ascending:
        return TableSortDirection.Descending;
      case TableSortDirection.Descending:
        return undefined;
      default:
        return TableSortDirection.Ascending;
    }
  }

  private pageDataFromUrl(params: ParamMap): Partial<PageEvent> | undefined {
    return this.syncWithUrl
      ? {
          pageSize: new NumberCoercer().coerce(params.get(TableComponent.PAGE_SIZE_URL_PARAM)),
          pageIndex: new NumberCoercer().coerce(params.get(TableComponent.PAGE_INDEX_URL_PARAM))
        }
      : undefined;
  }

  private sortDataFromUrl(params: ParamMap, columns: TableColumnConfig[]): Required<SortedColumn> | undefined {
    if (!this.syncWithUrl) {
      return undefined;
    }

    const sortColumn = columns.find(column => column.field === params.get(TableComponent.SORT_COLUMN_URL_PARAM));
    const sortDirection = params.get(TableComponent.SORT_DIRECTION_URL_PARAM) as TableSortDirection | null;

    return sortColumn && sortDirection
      ? {
          column: sortColumn,
          direction: sortDirection
        }
      : undefined;
  }
}

interface SortedColumn {
  column: TableColumnConfig;
  direction?: TableSortDirection;
}
