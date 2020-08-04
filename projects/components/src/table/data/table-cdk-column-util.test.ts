import { cloneDeep } from 'lodash-es';
import { StandardTableCellRendererType } from '../renderers/standard-table-cell-renderer-type';
import { TableColumnConfig, TableSortDirection } from '../table-api';
import { TableCdkColumnUtil } from './table-cdk-column-util';

describe('Table column util', () => {
  let dataColumnConfigs: TableColumnConfig[];
  let columnConfigs: TableColumnConfig[];
  let sortedColumnConfigs: TableColumnConfig[];

  beforeEach(() => {
    dataColumnConfigs = [
      {
        field: 'test-default',
        visible: true
      },
      {
        field: 'test-text',
        renderer: StandardTableCellRendererType.Text,
        visible: true
      },
      {
        field: 'test-numeric',
        renderer: StandardTableCellRendererType.Number,
        visible: true
      }
    ];

    columnConfigs = [
      ...dataColumnConfigs,
      {
        field: 'test-expander',
        renderer: StandardTableCellRendererType.RowExpander
      }
    ];

    sortedColumnConfigs = [
      {
        field: 'test-default',
        visible: true
      },
      {
        field: 'test-text',
        renderer: StandardTableCellRendererType.Text,
        sort: TableSortDirection.Ascending,
        visible: true
      },
      {
        field: 'test-numeric',
        renderer: StandardTableCellRendererType.Number,
        visible: true
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

  test('should unsort other columns when others already sorted', () => {
    TableCdkColumnUtil.unsortOtherColumns(sortedColumnConfigs[0], sortedColumnConfigs);
    expect(sortedColumnConfigs).toEqual(dataColumnConfigs);
  });

  test('should unsort other columns when others not sorted', () => {
    const cloned = cloneDeep(sortedColumnConfigs);
    TableCdkColumnUtil.unsortOtherColumns(cloned[1], cloned);
    expect(cloned).toEqual(sortedColumnConfigs);
  });
});
