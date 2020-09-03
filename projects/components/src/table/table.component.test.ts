import { Injector } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import {
  CoreTableCellRendererType,
  LetAsyncModule,
  StatefulTableRow,
  TableColumnConfig,
  TableColumnConfigExtended,
  TableMode,
  TableSelectionMode,
  TableSortDirection
} from '@hypertrace/components';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TableCellStringParser } from './cells/data-parsers/table-cell-string-parser';
import { TextTableCellRendererComponent } from './cells/data-renderers/text/text-table-cell-renderer.component';
import { TableCdkRowUtil } from './data/table-cdk-row-util';
import { TableComponent } from './table.component';
import { TableService } from './table.service';

describe('Table component', () => {
  // tslint:disable-next-line:prefer-const
  let mockInjector: Injector;

  // TODO remove builders once table stops mutating inputs
  const buildData = () => [
    {
      foo: 'bar'
    },
    {
      foo: 'baz'
    }
  ];

  const buildColumns = (): TableColumnConfigExtended[] => [
    {
      field: 'foo',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(mockInjector!),
      filterValues: []
    }
  ];
  const createHost = createHostFactory({
    component: TableComponent,
    shallow: true,
    imports: [LetAsyncModule],
    providers: [
      mockProvider(NavigationService),
      mockProvider(ActivatedRoute),
      mockProvider(ActivatedRoute, {
        queryParamMap: EMPTY
      }),
      mockProvider(TableService, {
        buildExtendedColumnConfigs: (columnConfigs: TableColumnConfig[]) => columnConfigs as TableColumnConfigExtended[]
      })
    ],
    declarations: [MockComponent(PaginatorComponent)],
    template: `
    <htc-table
      [columnConfigs]="columnConfigs"
      [data]="data"
      [syncWithUrl]="syncWithUrl">
    </htc-table>`
  });

  test('pass custom page size options to paginator', () => {
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [pageSizeOptions]="pageSizeOptions"></htc-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: buildData(),
          pageSizeOptions: [10, 25]
        }
      }
    );

    expect(spectator.query(PaginatorComponent)?.pageSizeOptions).toEqual([10, 25]);
  });

  test('does not alter the URL on paging if syncWithUrl false', () => {
    const mockPageChange = jest.fn();
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [syncWithUrl]="syncWithUrl"
         (pageChange)="pageChange($event)"></htc-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: buildData(),
          syncWithUrl: false,
          pageChange: mockPageChange
        }
      }
    );

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).not.toHaveBeenCalled();
    expect(mockPageChange).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 50
    });
  });

  test('updates the URL on paging if syncWithUrl true', () => {
    const mockPageChange = jest.fn();
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [syncWithUrl]="syncWithUrl"
         (pageChange)="pageChange($event)"></htc-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: buildData(),
          syncWithUrl: true,
          pageChange: mockPageChange
        }
      }
    );

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).toHaveBeenCalledWith({
      page: 1,
      'page-size': 50
    });
    expect(mockPageChange).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 50
    });
  });

  test('reads page data from URL if syncWithUrl true', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: buildColumns(),
        data: buildData(),
        syncWithUrl: true
      },
      providers: [
        mockProvider(ActivatedRoute, {
          queryParamMap: of(
            convertToParamMap({
              page: 1,
              'page-size': 100
            })
          )
        })
      ]
    });

    const paginator = spectator.query(PaginatorComponent);
    expect(paginator?.pageSize).toBe(100);
    expect(paginator?.pageIndex).toBe(1);
  });

  test('reads sort data from URL if syncWithUrl true', fakeAsync(() => {
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: buildColumns(),
        data: buildData(),
        syncWithUrl: true
      },
      providers: [
        mockProvider(ActivatedRoute, {
          queryParamMap: of(
            convertToParamMap({
              'sort-by': 'foo',
              'sort-direction': TableSortDirection.Ascending
            })
          )
        })
      ]
    });
    spectator.tick();

    expect(spectator.component.columnConfigs![0]).toEqual(
      expect.objectContaining({
        sort: TableSortDirection.Ascending,
        field: 'foo'
      })
    );
  }));

  test('does not alter the URL on sorting if syncWithUrl false', () => {
    const columns = buildColumns();
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: columns,
        data: buildData(),
        syncWithUrl: false
      }
    });

    spectator.component.onHeaderCellClick(columns[0]);

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).not.toHaveBeenCalled();
  });

  test('updates the URL on sorting if syncWithUrl true', () => {
    const columns = buildColumns();
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: columns,
        data: buildData(),
        syncWithUrl: true
      }
    });

    spectator.component.onHeaderCellClick(columns[0]);

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).toHaveBeenCalledWith({
      'sort-by': 'foo',
      'sort-direction': TableSortDirection.Ascending
    });
  });

  test('adds the multi select row column config for multi select mode', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(
      '<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode" [mode]="mode"></htc-table>',
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat
        }
      }
    );
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            field: '$$state',
            display: CoreTableCellRendererType.Checkbox,
            visible: true
          }),
          expect.objectContaining({
            field: 'foo'
          })
        ]
      });
    });
  }));

  test('skips the multi select row column config for single select mode', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(
      '<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode" [mode]="mode"></htc-table>',
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Single,
          mode: TableMode.Flat
        }
      }
    );
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            field: 'foo'
          })
        ]
      });
    });
  }));

  test('expander column config and no multi select row column config for non flat table mode', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(
      '<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode" [mode]="mode"></htc-table>',
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Tree
        }
      }
    );
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            field: '$$state',
            display: CoreTableCellRendererType.RowExpander,
            visible: true
          }),
          expect.objectContaining({
            field: 'foo'
          })
        ]
      });
    });
  }));

  test('should trigger toggle row selection for multi row select config', () => {
    const columns = buildColumns();
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" (selectionsChange)="selectionsChange($event)"></htc-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat
        }
      }
    );

    const row: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: false,
        selected: false,
        root: false,
        leaf: true,
        depth: 1
      }
    };

    const spyToggleRowSelection = spyOn(spectator.component, 'toggleRowSelected');
    spectator.component.onDataCellClick(row);
    expect(spyToggleRowSelection).toHaveBeenCalledWith(row);
  });

  test('should emit selections on toggle select', () => {
    const mockSelectionsChange = jest.fn();
    const columns = buildColumns();
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" (selectionsChange)="selectionsChange($event)"></htc-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat,
          selectionsChange: mockSelectionsChange
        }
      }
    );

    const row: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: false,
        selected: false,
        root: false,
        leaf: true,
        depth: 1
      }
    };

    spectator.component.toggleRowSelected(row);
    expect(mockSelectionsChange).toHaveBeenCalledWith([row]);

    spectator.component.toggleRowSelected(row);
    expect(mockSelectionsChange).toHaveBeenCalledWith([row]);
  });

  test('should select only selected rows', fakeAsync(() => {
    const columns = buildColumns();
    const rows = buildData();
    const statefulRows = TableCdkRowUtil.buildInitialRowStates(rows);
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" [selections]="selections"></htc-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: rows,
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat,
          selections: statefulRows
        }
      }
    );

    spectator.tick();

    expect(spectator.component.selections).toBeDefined();
    statefulRows.forEach(row => expect(row.$$state.selected).toBeTruthy());

    // Change selections to just first stateful row
    const firstStatefulRow = statefulRows[0];
    const spyUnselectRows = spyOn(spectator.component.dataSource!, 'unselectAllRows');
    spectator.setHostInput('selections', [firstStatefulRow]);
    spectator.detectChanges();
    expect(spyUnselectRows).toHaveBeenCalled();
    expect(firstStatefulRow.$$state.selected).toBeTruthy();
  }));

  test('row should be highlighted only in non multi selection mode', () => {
    const columns = buildColumns();
    const rows = buildData();
    const statefulRows = TableCdkRowUtil.buildInitialRowStates(rows);
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" [selections]="selections"></htc-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: rows,
          selectionMode: TableSelectionMode.Single,
          mode: TableMode.Flat,
          selections: [statefulRows[0]]
        }
      }
    );

    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[0])).toBeTruthy();
    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[1])).toBeFalsy();
  });

  test('row should not be highlighted only in multi selection mode', () => {
    const columns = buildColumns();
    const rows = buildData();
    const statefulRows = TableCdkRowUtil.buildInitialRowStates(rows);
    const spectator = createHost(
      `<htc-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" [selections]="selections"></htc-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: rows,
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat,
          selections: [statefulRows[0]]
        }
      }
    );

    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[0])).toBeFalsy();
    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[1])).toBeFalsy();
  });
});
