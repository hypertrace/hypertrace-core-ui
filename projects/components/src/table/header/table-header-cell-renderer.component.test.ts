import { TableCellAlignmentType, TableColumnConfig } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { TableCellRendererLookupService } from '../cells/table-cell-renderer-lookup.service';
import { TableHeaderCellRendererComponent } from './table-header-cell-renderer.component';

describe('Table Header Cell Renderer', () => {
  const createHost = createHostFactory({
    component: TableHeaderCellRendererComponent,
    shallow: true,
    providers: [
      mockProvider(TableCellRendererLookupService, {
        lookup: () => ({
          alignment: TableCellAlignmentType.Center
        })
      })
    ]
  });

  test('should have sortable class, if column can be sorted', () => {
    const columnConfig: TableColumnConfig = {
      field: 'test-column',
      sortable: true
    };

    const spectator = createHost(
      `<htc-table-header-cell-renderer [columnConfig]="columnConfig" index="0"></htc-table-header-cell-renderer>`,
      {
        hostProps: {
          columnConfig: columnConfig
        }
      }
    );

    expect(spectator.query('.table-header-cell-renderer')).toHaveClass('sortable');
  });

  test('should not have sortable class, if column cannot be sorted', () => {
    const columnConfig: TableColumnConfig = {
      field: 'test-column',
      sortable: false
    };

    const spectator = createHost(
      `<htc-table-header-cell-renderer [columnConfig]="columnConfig" index="0"></htc-table-header-cell-renderer>`,
      {
        hostProps: {
          columnConfig: columnConfig
        }
      }
    );

    expect(spectator.query('.table-header-cell-renderer')).not.toHaveClass('sortable');
  });
});
