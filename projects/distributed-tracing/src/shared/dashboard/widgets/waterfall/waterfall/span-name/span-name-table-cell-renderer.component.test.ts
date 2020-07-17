import { Dictionary, FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';

import {
  TableColumnConfig,
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from '@hypertrace/components';
import { SpanNameTableCellRendererComponent } from './span-name-table-cell-renderer.component';

describe('Span name table cell renderer component', () => {
  const spanNameData = {
    serviceName: 'test-entity',
    protocolName: 'test-protocol',
    name: 'test-span-name'
  };
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
    component: SpanNameTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({ field: 'test' }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(spanNameData),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render span name without color and build tooltip ', () => {
    const spectator = buildComponent();

    const tooltip = `${spanNameData.serviceName} ${spanNameData.protocolName} ${spanNameData.name}`;

    expect(spectator.component.value).toEqual({ ...spanNameData, tooltip: tooltip });
    expect(spectator.query('.service-name')).toHaveText('test-entity');
    expect(spectator.query('.protocol-name')).toHaveText('test-protocol');
    expect(spectator.query('.span-name')).toHaveText('test-span-name');
    expect(spectator.query('.color-bar')).not.toExist();
  });

  test('should render span name with colorand build tooltip ', () => {
    const spanNameDataWithColor = {
      ...spanNameData,
      color: 'blue'
    };
    const spectator = buildComponent({
      providers: [tableCellDataRendererCellDataProvider(spanNameDataWithColor)]
    });

    const tooltip = `${spanNameData.serviceName} ${spanNameData.protocolName} ${spanNameData.name}`;

    expect(spectator.component.value).toEqual({ ...spanNameData, tooltip: tooltip, color: 'blue' });
    expect(spectator.query('.service-name')).toHaveText('test-entity');
    expect(spectator.query('.protocol-name')).toHaveText('test-protocol');
    expect(spectator.query('.span-name')).toHaveText('test-span-name');
    expect(spectator.query('.color-bar')).toExist();
  });
});
