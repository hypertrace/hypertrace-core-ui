import { StandardTableCellRendererType } from '../cells/types/standard-table-cell-renderer-type';
import { TableColumnConfig, TableSortDirection } from '../table-api';
import { TableCdkColumnUtil } from './table-cdk-column-util';

describe('Table column util', () => {
  let dataColumnConfigs: TableColumnConfig[];
  let columnConfigs: TableColumnConfig[];

  beforeEach(() => {
    dataColumnConfigs = [
      {
        field: 'test-default',
        visible: true,
        sort: TableSortDirection.Ascending,
        sortable: true
      },
      {
        field: 'test-text',
        renderer: StandardTableCellRendererType.Text,
        visible: true
      },
      {
        field: 'test-numeric',
        renderer: StandardTableCellRendererType.Number,
        visible: true,
        sortable: false
      }
    ];

    columnConfigs = [
      ...dataColumnConfigs,
      {
        field: 'test-expander',
        renderer: StandardTableCellRendererType.RowExpander
      }
    ];
  });

  test('should check if column is changed', () => {
    expect(TableCdkColumnUtil.isColumnStateChange(columnConfigs[0])).toEqual(true);
    expect(TableCdkColumnUtil.isColumnStateChange(undefined)).toEqual(false);
  });

  test('should remove row expander', () => {
    expect(TableCdkColumnUtil.fetchableColumnConfigs(columnConfigs)).toEqual(dataColumnConfigs);
  });

  test('should unsort other columns', () => {
    TableCdkColumnUtil.unsortOtherColumns(dataColumnConfigs[0], dataColumnConfigs);
    expect(dataColumnConfigs).toEqual([
      {
        field: 'test-default',
        visible: true,
        sort: TableSortDirection.Ascending,
        sortable: true
      },
      {
        field: 'test-text',
        renderer: StandardTableCellRendererType.Text,
        visible: true,
        sortable: false
      },
      {
        field: 'test-numeric',
        renderer: StandardTableCellRendererType.Number,
        visible: true,
        sortable: false
      }
    ]);
  });

  test('should check sortable for column config', () => {
    expect(TableCdkColumnUtil.isColumnSortable(dataColumnConfigs[0])).toBeTruthy();
    expect(TableCdkColumnUtil.isColumnSortable(dataColumnConfigs[1])).toBeTruthy();
    expect(TableCdkColumnUtil.isColumnSortable(dataColumnConfigs[2])).toBeFalsy();
  });
});
