import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { Dictionary, NavigationService } from '@hypertrace/common';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { IconModule } from '../../../../icon/icon.module';
import { TableColumnConfig } from '../../../table-api';
import {
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from '../../table-cell-renderer';
import { IconTableCellRendererComponent } from './icon-table-cell-renderer.component';

describe('Icon table cell renderer component', () => {
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
    component: IconTableCellRendererComponent,
    imports: [IconModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(NavigationService),
      tableCellRendererColumnProvider({ field: 'test' }),
      tableCellRendererIndexProvider(0),
      tableCellDataRendererCellDataProvider(IconType.AddCircleOutline),
      tableRowDataRendererRowDataProvider({})
    ],
    shallow: true
  });

  test('should render an icon', () => {
    const spectator = buildComponent();

    const element = spectator.query('.htc-icon');

    expect(element).toHaveExactText(IconType.AddCircleOutline);
    expect(element).toHaveAttribute('aria-label', 'add_circle_outline');
  });

  test('should not add clickable class for clickable columns', () => {
    const spectator = buildComponent();

    const element = spectator.query('.clickable');

    expect(element).not.toHaveClass('clickable');
  });

  test('should add clickable class for columns without a click handler', () => {
    const spectator = buildComponent({
      providers: [
        tableCellRendererColumnProvider({
          field: 'test',
          onClick: () => {
            /* NOOP */
          }
        })
      ]
    });

    const element = spectator.query('.clickable');

    expect(element).toHaveClass('clickable');
  });
});
