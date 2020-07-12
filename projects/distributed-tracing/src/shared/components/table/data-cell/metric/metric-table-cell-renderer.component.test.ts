import { Dictionary, FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MetricHealth } from '../../../../graphql/model/metrics/metric-health';

import {
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA,
  TableColumnConfig
} from '@hypertrace/components';
import { MetricTableCellRendererComponent } from './metric-table-cell-renderer.component';

describe('Metric table cell renderer component', () => {
  const tableCellRendererColumnProvider = (column: TableColumnConfig) => ({
    provide: TABLE_CELL_RENDERER_COLUMN_CONFIG,
    useValue: column
  });

  const tableCellRendererIndexProvider = (index: number) => ({
    provide: TABLE_CELL_RENDERER_COLUMN_INDEX,
    useValue: index
  });

  const tableCellDataRendererCellDataProvider = (cellData: unknown) => ({
    provide: TABLE_CELL_RENDERER_CELL_DATA,
    useValue: cellData
  });

  const tableRowDataRendererRowDataProvider = (rowData: Dictionary<unknown>) => ({
    provide: TABLE_CELL_RENDERER_ROW_DATA,
    useValue: rowData
  });

  const buildComponent = createComponentFactory({
    component: MetricTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({ field: 'test' }),
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
