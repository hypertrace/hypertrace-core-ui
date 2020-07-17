import { Dictionary, FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';

import {
  TableColumnConfig,
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from '@hypertrace/components';
import { TraceStatus, TraceStatusType } from '../../../../../shared/graphql/model/schema/trace';
import { TraceStatusTableCellRendererComponent } from './trace-status-table-cell-renderer.component';

describe('Timestamp table cell renderer component', () => {
  const traceStatus: TraceStatus = {
    status: TraceStatusType.FAIL,
    statusCode: '404',
    statusMessage: 'Not Found'
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
    component: TraceStatusTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({ field: 'test' }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(traceStatus),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render trace status with correct data', () => {
    const spectator = buildComponent();

    expect(spectator.component.value).toEqual(traceStatus);
    expect(spectator.query('.trace-status')).toHaveText('404 - Not Found');
  });
});
