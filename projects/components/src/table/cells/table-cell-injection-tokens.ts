import { InjectionToken } from '@angular/core';
import { TableColumnConfig } from '../table-api';

export const TABLE_COLUMN_CONFIG: InjectionToken<TableColumnConfig> = new InjectionToken('TABLE_COLUMN_CONFIG');
export const TABLE_COLUMN_INDEX: InjectionToken<TableColumnConfig> = new InjectionToken('TABLE_COLUMN_INDEX');
export const TABLE_CELL_DATA: InjectionToken<unknown> = new InjectionToken('TABLE_CELL_DATA');
export const TABLE_ROW_DATA: InjectionToken<unknown> = new InjectionToken('TABLE_ROW_DATA');
