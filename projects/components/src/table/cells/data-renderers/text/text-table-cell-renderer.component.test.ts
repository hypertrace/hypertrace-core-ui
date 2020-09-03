import { FormattingModule } from '@hypertrace/common';
import { byText, createComponentFactory } from '@ngneat/spectator/jest';
import { TableColumnConfigExtended, TableRow } from '../../../table-api';
import { TableCellStringParser } from '../../data-parsers/table-cell-string-parser';
import { TABLE_CELL_DATA, TABLE_COLUMN_CONFIG, TABLE_COLUMN_INDEX, TABLE_ROW_DATA } from '../../table-cell-injection';
import { TextTableCellRendererComponent } from './text-table-cell-renderer.component';

describe('Text table cell renderer component', () => {
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
    component: TextTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({
        field: 'test',
        renderer: TextTableCellRendererComponent,
        parser: new TableCellStringParser(undefined!),
        filterValues: []
      }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(undefined),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render a plain string', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider('test-text')]
    });

    expect(spectator.element).toHaveText('test-text');
  });

  test('should render a missing string', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('');
  });

  test('should add clickable class for clickable columns', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataRendererCellDataProvider('test-text'),
        tableCellRendererColumnProvider({
          field: 'test',
          renderer: TextTableCellRendererComponent,
          parser: new TableCellStringParser(undefined!),
          filterValues: [],
          onClick: () => {
            /* NOOP */
          }
        })
      ]
    });

    expect(spectator.query(byText('test-text'))).toHaveClass('clickable');
  });

  test('should not add clickable class for columns without a click handler', () => {
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider('test-text')]
    });

    expect(spectator.query(byText('test-text'))).not.toHaveClass('clickable');
  });
});
