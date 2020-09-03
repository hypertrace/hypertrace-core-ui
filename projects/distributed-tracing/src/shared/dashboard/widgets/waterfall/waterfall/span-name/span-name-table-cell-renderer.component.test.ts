import { FormattingModule } from '@hypertrace/common';
import {
  TableColumnConfigExtended,
  TableRow,
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_ROW_DATA
} from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { SpanNameTableCellParser } from './span-name-table-cell-parser';
import { SpanNameTableCellRendererComponent } from './span-name-table-cell-renderer.component';

describe('Span name table cell renderer component', () => {
  const spanNameData = {
    serviceName: 'test-entity',
    protocolName: 'test-protocol',
    name: 'test-span-name'
  };
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
    component: SpanNameTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({
        field: 'test',
        renderer: SpanNameTableCellRendererComponent,
        parser: new SpanNameTableCellParser(undefined!),
        filterValues: []
      }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(spanNameData),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render span name without color and build tooltip ', () => {
    const spectator = buildComponent();

    const tooltip = `${spanNameData.serviceName} ${spanNameData.protocolName} ${spanNameData.name}`;

    expect(spectator.component.value).toEqual(spanNameData);
    expect(spectator.component.tooltip).toEqual(tooltip);
    expect(spectator.query('.service-name')).toHaveText('test-entity');
    expect(spectator.query('.protocol-name')).toHaveText('test-protocol');
    expect(spectator.query('.span-name')).toHaveText('test-span-name');
    expect(spectator.query('.color-bar')).not.toExist();
  });

  test('should render span name with color and build tooltip ', () => {
    const spanNameDataWithColor = {
      ...spanNameData,
      color: 'blue'
    };
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider(spanNameDataWithColor)]
    });

    const tooltip = `${spanNameData.serviceName} ${spanNameData.protocolName} ${spanNameData.name}`;

    expect(spectator.component.value).toEqual(spanNameDataWithColor);
    expect(spectator.component.tooltip).toEqual(tooltip);
    expect(spectator.query('.service-name')).toHaveText('test-entity');
    expect(spectator.query('.protocol-name')).toHaveText('test-protocol');
    expect(spectator.query('.span-name')).toHaveText('test-span-name');
    expect(spectator.query('.color-bar')).toExist();
  });
});
