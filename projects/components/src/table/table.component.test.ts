import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import { LetAsyncModule, TableSortDirection } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TableHeaderCellRendererComponent } from './renderers/header-cell/table-header-cell-renderer.component';
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
    declarations: [MockComponent(PaginatorComponent), MockComponent(TableHeaderCellRendererComponent)],
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
              sort: 'foo',
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
      sort: 'foo',
      'sort-direction': TableSortDirection.Ascending
    });
  });
});
