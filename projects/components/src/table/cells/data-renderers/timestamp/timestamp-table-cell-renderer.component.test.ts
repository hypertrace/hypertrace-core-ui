import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { TableColumnConfig, TableRow } from '../../../table-api';
import {
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_ROW_DATA
} from '../../table-cell-injection-tokens';
import { TimestampTableCellRendererComponent } from './timestamp-table-cell-renderer.component';

describe('Timestamp table cell renderer component', () => {
  const tableCellRendererColumnProvider = (column: TableColumnConfig) => ({
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
    component: TimestampTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({ field: 'test' }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(undefined),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('renders a timestamp with format y-M-d hh:mm:ss a', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider(new Date('2019-10-25T18:35:25.428Z').getTime())]
    });

    expect(spectator.element).toHaveText('2019-10-25 06:35:25 PM');
  });

  test('renders a date with format y-M-d hh:mm:ss a', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider(new Date('2019-10-25T18:35:25.428Z'))]
    });

    expect(spectator.element).toHaveText('2019-10-25 06:35:25 PM');
  });

  test('renders a missing date', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });
});
