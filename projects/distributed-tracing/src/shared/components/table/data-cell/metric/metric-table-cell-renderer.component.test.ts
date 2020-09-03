import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MetricHealth } from '../../../../graphql/model/metrics/metric-health';

import {
  TableColumnConfigExtended,
  TableRow,
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_ROW_DATA
} from '@hypertrace/components';
import { MetricTableCellParser } from './metric-table-cell-parser';
import { MetricTableCellRendererComponent } from './metric-table-cell-renderer.component';

describe('Metric table cell renderer component', () => {
  const tableCellRendererColumnProvider = (column: TableColumnConfigExtended) => ({
    provide: TABLE_COLUMN_CONFIG,
    useValue: column
  });

  const tableCellRendererIndexProvider = (index: number) => ({
    provide: TABLE_COLUMN_INDEX,
    useValue: index
  });

  const tableCellDataRendererCellDataProvider = (cellData: unknown) => ({
    provide: TABLE_CELL_DATA,
    useValue: cellData
  });

  const tableRowDataRendererRowDataProvider = (rowData: TableRow) => ({
    provide: TABLE_ROW_DATA,
    useValue: rowData
  });

  const buildComponent = createComponentFactory({
    component: MetricTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({
        field: 'test',
        renderer: MetricTableCellRendererComponent,
        parser: new MetricTableCellParser(undefined!),
        filterValues: []
      }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(undefined),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render a number', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider(42)]
    });

    expect(spectator.element).toHaveText('42');
  });

  test('should render a number with unit', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataRendererCellDataProvider({
          value: 42,
          units: 'ms'
        })
      ]
    });

    expect(spectator.element).toHaveText('42 ms');
  });

  test('should render a number with health', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataRendererCellDataProvider({
          value: 76,
          health: MetricHealth.Healthy
        })
      ]
    });

    expect(spectator.element).toHaveText('76');
  });

  test('should render an empty object', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider({})]
    });

    expect(spectator.element).toHaveText('-');
  });

  test('should render an undefined value', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });
});
