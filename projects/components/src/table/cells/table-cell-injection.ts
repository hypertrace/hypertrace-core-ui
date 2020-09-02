import { InjectionToken, Injector } from '@angular/core';
import { TableColumnConfig, TableColumnConfigExtended, TableRow } from '../table-api';

export const TABLE_COLUMN_CONFIG: InjectionToken<TableColumnConfig> = new InjectionToken('TABLE_COLUMN_CONFIG');
export const TABLE_COLUMN_INDEX: InjectionToken<TableColumnConfig> = new InjectionToken('TABLE_COLUMN_INDEX');
export const TABLE_CELL_DATA: InjectionToken<unknown> = new InjectionToken('TABLE_CELL_DATA');
export const TABLE_ROW_DATA: InjectionToken<unknown> = new InjectionToken('TABLE_ROW_DATA');

export const createInjector = (
  columnConfig: TableColumnConfigExtended,
  index: number,
  cellData: unknown,
  row: TableRow,
  injector: Injector
): Injector =>
  Injector.create({
    providers: [
      {
        provide: TABLE_COLUMN_CONFIG,
        useValue: columnConfig
      },
      {
        provide: TABLE_COLUMN_INDEX,
        useValue: index
      },
      {
        provide: TABLE_CELL_DATA,
        useValue: cellData
      },
      {
        provide: TABLE_ROW_DATA,
        useValue: row
      }
    ],
    parent: injector
  });
