import { DataSource } from '@angular/cdk/collections';
import { forkJoinSafeEmpty, isEqualIgnoreFunctions, RequireBy } from '@hypertrace/common';
import { combineLatest, NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, flatMap, map, mergeMap, startWith, tap } from 'rxjs/operators';
import { PageEvent } from '../../paginator/page.event';
import { PaginationProvider } from '../../paginator/paginator-api';
import { RowStateChange, StatefulTableRow, StatefulTreeTableRow, TableColumnConfig, TableRow } from '../table-api';
import { TableCdkColumnUtil } from './table-cdk-column-util';
import {
  ColumnConfigProvider,
  ColumnStateChangeProvider,
  FilterProvider,
  RowStateChangeProvider,
  TableDataSourceProvider
} from './table-cdk-data-source-api';
import { TableCdkRowUtil } from './table-cdk-row-util';
import { TableDataRequest } from './table-data-source';

type WatchedObservables = [
  TableColumnConfig[],
  PageEvent,
  string,
  TableColumnConfig | undefined,
  StatefulTableRow | undefined
];

export class TableCdkDataSource implements DataSource<TableRow> {
  private static readonly DEFAULT_PAGE_SIZE: number = 1000;
  private static readonly FILTER_DEBOUNCE_MS: number = 200;

  private cachedRows: StatefulTableRow[] = [];
  private lastRowChange: StatefulTableRow | undefined;
  private readonly rowsChange$: Subject<StatefulTableRow[]> = new Subject<StatefulTableRow[]>();
  public loadingState: Subject<Observable<StatefulTableRow[]>> = new Subject<Observable<StatefulTableRow[]>>();
  public loadingStateChange$: Observable<Observable<StatefulTableRow[]>> = this.loadingState.asObservable();

  public constructor(
    private readonly tableDataSourceProvider: TableDataSourceProvider,
    private readonly columnConfigProvider: ColumnConfigProvider,
    private readonly columnStateChangeProvider: ColumnStateChangeProvider,
    private readonly rowStateChangeProvider: RowStateChangeProvider,
    private readonly filterProvider?: FilterProvider,
    private readonly paginationProvider?: PaginationProvider
  ) {}

  /****************************
   * Connection
   ****************************/

  public connect(): Observable<ReadonlyArray<TableRow>> {
    this.buildChangeObservable()
      .pipe(
        tap(() => this.loadingState.next(NEVER)),
        mergeMap(([columnConfigs, pageEvent, filter, changedColumn, changedRow]) =>
          this.buildDataObservable(columnConfigs, pageEvent, filter, changedColumn, changedRow)
        )
      )
      .subscribe(this.rowsChange$);

    return this.rowsChange$.pipe(
      tap(rows => this.cacheRows(rows)),
      tap(rows => this.loadingState.next(of(rows)))
    );
  }

  public disconnect(): void {
    this.rowsChange$.complete();
    this.loadingState.complete();
  }

  private cacheRows(rows: StatefulTableRow[]): void {
    this.cachedRows = rows.map(TableCdkRowUtil.cloneRow);
  }

  /****************************
   * API
   ****************************/

  public expandAllRows(): void {
    if (TableCdkRowUtil.isFullyExpandable(this.cachedRows)) {
      const rows = TableCdkRowUtil.expandAllRows(this.cachedRows);
      this.rowsChange$.next(rows);
    }
  }

  public collapseAllRows(): void {
    const rows = TableCdkRowUtil.collapseAllRows(this.cachedRows);
    this.rowsChange$.next(rows);
  }

  /****************************
   * Change Detection
   ****************************/

  private buildChangeObservable(): Observable<WatchedObservables> {
    return combineLatest([
      this.columnConfigProvider.columnConfigs$,
      this.pageChange(),
      this.filterChange(),
      this.columnStateChangeProvider.columnState$,
      this.rowStateChangeProvider.rowState$
    ]).pipe(map(values => this.detectRowStateChanges(...values)));
  }

  private pageChange(): Observable<PageEvent> {
    return this.paginationProvider
      ? this.paginationProvider.pageEvent$.pipe(
          startWith({ pageSize: this.paginationProvider.pageSize, pageIndex: this.paginationProvider.pageIndex })
        )
      : of({ pageSize: TableCdkDataSource.DEFAULT_PAGE_SIZE, pageIndex: 0 });
  }

  private filterChange(): Observable<string> {
    return this.filterProvider
      ? this.filterProvider.filter$.pipe(debounceTime(TableCdkDataSource.FILTER_DEBOUNCE_MS))
      : of('');
  }

  private detectRowStateChanges(
    columnConfigs: TableColumnConfig[],
    pageEvent: PageEvent,
    filter: string,
    changedColumn: TableColumnConfig | undefined,
    changedRow: StatefulTableRow | undefined
  ): WatchedObservables {
    return [columnConfigs, pageEvent, filter, changedColumn, this.buildRowStateChange(changedRow)];
  }

  private buildRowStateChange(changedRow: StatefulTableRow | undefined): StatefulTableRow | undefined {
    const isChange = !isEqualIgnoreFunctions(this.lastRowChange, changedRow);

    if (changedRow !== undefined) {
      /*
       * combineLatest will keep returning the same changedRow, so we never want to compare to the undefined
       */
      this.lastRowChange = TableCdkRowUtil.cloneRow(changedRow);
    }

    return isChange ? changedRow : undefined;
  }

  /****************************
   * Data
   ****************************/

  private buildDataObservable(
    columnConfigs: TableColumnConfig[],
    pageEvent: PageEvent,
    filter: string,
    changedColumn: TableColumnConfig | undefined,
    changedRow: StatefulTableRow | undefined
  ): Observable<StatefulTableRow[]> {
    if (changedRow !== undefined) {
      return of(this.cachedRows).pipe(
        map(cachedRows => TableCdkRowUtil.buildRowStateChanges(cachedRows, changedRow)),
        flatMap(stateChanges => this.fetchAndAppendNewChildren(stateChanges)),
        map(TableCdkRowUtil.removeCollapsedRows)
      );
    }

    if (TableCdkColumnUtil.isColumnStateChange(changedColumn)) {
      TableCdkColumnUtil.unsortOtherColumns(changedColumn, columnConfigs);
    }

    return this.fetchNewData(columnConfigs, pageEvent, filter);
  }

  private fetchAndAppendNewChildren(stateChanges: RowStateChange[]): Observable<StatefulTableRow[]> {
    return forkJoinSafeEmpty(
      stateChanges.map(stateChange => {
        // We also need to use the new state for cached entries that have changed
        const latest: StatefulTableRow = TableCdkRowUtil.latestRowChange(stateChange);

        // If we have a changed row that is newly expanded, then fetch the children
        if (TableCdkRowUtil.isNewlyExpandedParentRow(stateChange) && TableCdkRowUtil.isStatefulTreeTableRow(latest)) {
          return this.fetchAndAppendChildren(latest);
        }

        return of(latest);
      })
    ).pipe(map(TableCdkRowUtil.flattenNestedRows));
  }

  private fetchAndAppendChildren(parent: StatefulTreeTableRow): Observable<StatefulTableRow[]> {
    return parent.getChildren().pipe(
      map(childRows => TableCdkRowUtil.buildInitialChildRowStates(childRows, parent)),
      map(children => [parent, ...children])
    );
  }

  private fetchNewData(
    columnConfigs: TableColumnConfig[],
    pageEvent: PageEvent,
    searchQuery: string
  ): Observable<StatefulTableRow[]> {
    if (this.tableDataSourceProvider.data === undefined) {
      return of([]);
    }

    return this.tableDataSourceProvider.data.getData(this.buildRequest(columnConfigs, pageEvent, searchQuery)).pipe(
      tap(response => this.updatePaginationTotalCount(response.totalCount)),
      map(response => response.data),
      map(rows => this.paginateRows(rows, pageEvent)),
      map(TableCdkRowUtil.buildInitialRowStates),
      map(rows =>
        this.rowStateChangeProvider.initialExpandAll && TableCdkRowUtil.isFullyExpandable(rows)
          ? TableCdkRowUtil.expandAllRows(rows)
          : rows
      ),
      catchError(error => {
        this.loadingState.next(throwError(error));

        return [];
      })
    );
  }

  private buildRequest(columnConfigs: TableColumnConfig[], pageConfig: PageEvent, filter: string): TableDataRequest {
    const request: TableDataRequest = {
      columns: TableCdkColumnUtil.removeNonDataConfigs(columnConfigs),
      position: {
        startIndex: pageConfig.pageIndex * pageConfig.pageSize,
        limit: pageConfig.pageSize
      },
      filter: filter
    };

    columnConfigs
      .filter((columnConfig): columnConfig is RequireBy<TableColumnConfig, 'sort'> => columnConfig.sort !== undefined)
      .forEach(columnConfig => {
        /*
         * NOTE: The columnConfigs are set up to allow multi-column sorting, but this is not currently supported.
         * In the row state modification we should be enforcing only one sorted column.
         */
        request.sort = {
          column: columnConfig,
          direction: columnConfig.sort
        };
      });

    return request;
  }

  /****************************
   * Pagination
   ****************************/

  private paginateRows(rows: TableRow[], pageConfig: PageEvent): TableRow[] {
    /*
     * The "rows" here are the results that are fetched. Since they are fetched with an offset in the request, we just
     * index off the start of the result rows.
     */
    const start = 0;
    const end = pageConfig.pageSize;

    return rows.slice(start, end);
  }

  private updatePaginationTotalCount(totalItems: number): void {
    if (this.paginationProvider) {
      this.paginationProvider.totalItems = totalItems;
    }
  }
}
