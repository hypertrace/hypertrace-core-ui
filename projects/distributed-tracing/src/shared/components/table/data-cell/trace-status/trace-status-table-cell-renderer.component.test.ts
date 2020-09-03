import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';

import {
  TableColumnConfigExtended,
  TableRow,
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_ROW_DATA
} from '@hypertrace/components';
import { TraceStatus, TraceStatusType } from '../../../../../shared/graphql/model/schema/trace';
import { TraceStatusTableCellParser } from './trace-status-table-cell-parser';
import { TraceStatusTableCellRendererComponent } from './trace-status-table-cell-renderer.component';

describe('Trace status table cell renderer component', () => {
  const traceStatus: TraceStatus = {
    status: TraceStatusType.FAIL,
    statusCode: '404',
    statusMessage: 'Not Found'
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
    component: TraceStatusTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellRendererColumnProvider({
        field: 'test',
        renderer: TraceStatusTableCellRendererComponent,
        parser: new TraceStatusTableCellParser(undefined!),
        filterValues: []
      }),
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
