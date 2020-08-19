import { FormattingModule } from '@hypertrace/common';
import { byText, createComponentFactory } from '@ngneat/spectator/jest';
import { TableColumnConfig, TableRow } from '../../../table-api';
import {
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from '../../table-cell-renderer';
import { NumericTableCellRendererComponent } from './numeric-table-cell-renderer.component';

describe('Numeric table cell renderer component', () => {
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

  const tableRowDataRendererRowDataProvider = (rowData: TableRow) => ({
    provide: TABLE_CELL_RENDERER_ROW_DATA,
    useValue: rowData
  });

  const buildComponent = createComponentFactory({
    component: NumericTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({ field: 'test' }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(undefined),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render a plain number', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider(36)]
    });

    expect(spectator.element).toHaveText('36');
  });

  test('should render a missing number', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });

  test('should add clickable class for clickable columns', () => {
    const spectator = buildComponent({
      providers: [
        tableCellRendererColumnProvider({
          field: 'test',
          onClick: () => {
            /* NOOP */
          }
        }),
        tableCellDataRendererCellDataProvider(42)
      ]
    });

    expect(spectator.query(byText('42'))).toHaveClass('clickable');
  });

  test('should not add clickable class for columns without a click handler', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider(22)]
    });

    expect(spectator.query(byText('22'))).not.toHaveClass('clickable');
  });
});
