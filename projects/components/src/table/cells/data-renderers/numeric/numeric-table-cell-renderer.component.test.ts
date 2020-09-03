import { FormattingModule } from '@hypertrace/common';
import { byText, createComponentFactory } from '@ngneat/spectator/jest';
import { TableColumnConfigExtended, TableRow } from '../../../table-api';
import { TableCellNumberParser } from '../../data-parsers/table-cell-number-parser';
import { TABLE_CELL_DATA, TABLE_COLUMN_CONFIG, TABLE_COLUMN_INDEX, TABLE_ROW_DATA } from '../../table-cell-injection';
import { NumericTableCellRendererComponent } from './numeric-table-cell-renderer.component';

describe('Numeric table cell renderer component', () => {
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
    component: NumericTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({
        field: 'test',
        renderer: NumericTableCellRendererComponent,
        parser: new TableCellNumberParser(undefined!),
        filterValues: []
      }),
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
          renderer: NumericTableCellRendererComponent,
          parser: new TableCellNumberParser(undefined!),
          filterValues: [],
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
