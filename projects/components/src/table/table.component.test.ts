import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import {
  LetAsyncModule,
  StandardTableCellRendererType,
  StatefulTableRow,
  TableMode,
  TableSelectionMode,
  TableSortDirection
} from '@hypertrace/components';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TableComponent } from './table.component';

describe('Table component', () => {
  // TODO remove builders once table stops mutating inputs
  const buildData = () => [
    {
      foo: 'bar'
    },
    {
      foo: 'baz'
    }
  ];

  const buildColumns = () => [
    {
      field: 'foo'
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
      mockProvider(NavigationService)
    ],
    declarations: [MockComponent(PaginatorComponent)],
    template: `
    <htc-table
      [columnConfigs]="columnConfigs"
      [data]="data"
      [syncWithUrl]="syncWithUrl">
    </htc-table>`
  });

  test('does not alter the URL on paging if syncWithUrl false', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: buildColumns(),
        data: buildData(),
        syncWithUrl: false
      }
    });

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).not.toHaveBeenCalled();
  });

  test('updates the URL on paging if syncWithUrl true', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: buildColumns(),
        data: buildData(),
        syncWithUrl: true
      }
    });

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).toHaveBeenCalledWith({
      page: 1,
      'page-size': 50
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

  test('reads sort data from URL if syncWithUrl true', () => {
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

    expect(spectator.component.columnConfigs![0]).toEqual(
      expect.objectContaining({
        sort: TableSortDirection.Ascending,
        field: 'foo'
      })
    );
  });

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

  test('adds the multi select row column config for multi select mode', () => {
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

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            field: '$$state',
            renderer: StandardTableCellRendererType.Checkbox,
            visible: true
          }),
          {
            field: 'foo'
          }
        ]
      });
    });
  });

  test('skips the multi select row column config for single select mode', () => {
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

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          {
            field: 'foo'
          }
        ]
      });
    });
  });

  test('expander column config and no multi select row column config for non flat table mode', () => {
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

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            field: '$$state',
            renderer: StandardTableCellRendererType.RowExpander,
            visible: true
          }),
          {
            field: 'foo'
          }
        ]
      });
    });
  });

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

    const multiSelectRowColumnConfig = spectator.component.columnConfigsSubject.value[0];
    const spyToggleRowSelection = spyOn(spectator.component, 'toggleRowSelection');
    spectator.component.onDataCellClick(multiSelectRowColumnConfig, row);
    expect(spyToggleRowSelection).toHaveBeenCalledWith(row);
  });

  test('should toggle selection state and emit selections', () => {
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

    {
      spectator.component.toggleRowSelection(row);

      const selections = spectator.component.selections;
      expect(row.$$state.selected).toBeTruthy();
      expect(selections).toBeDefined();
      expect(selections!.length).toEqual(1);
      expect(selections![0]).toEqual(row);
      expect(mockSelectionsChange).toHaveBeenCalledWith([row]);
    }

    {
      spectator.component.toggleRowSelection(row);

      const selections = spectator.component.selections;
      expect(row.$$state.selected).toBeFalsy();
      expect(selections).toBeDefined();
      expect(selections!.length).toEqual(0);
      expect(mockSelectionsChange).toHaveBeenCalledWith([]);
    }
  });
});
