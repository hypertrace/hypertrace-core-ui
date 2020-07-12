import { InjectionToken, Type } from '@angular/core';
import { TableColumnConfig } from '../table-api';
import { TableCellAlignmentType } from './table-cell-alignment-type';
import { TableCellRendererComponent } from './table-cell-renderer.component';

export interface TableCellRendererMetadata {
  type: string;
  alignment: TableCellAlignmentType;
}

export interface TableCellRendererConstructor
  extends Type<TableCellRendererComponent<unknown, unknown>>,
    TableCellRendererMetadata {}

type TableCellRendererDecorator = (constructor: TableCellRendererConstructor) => void;

// tslint:disable-next-line:only-arrow-functions
export function TableCellRenderer(tableCellRendererMetadata: TableCellRendererMetadata): TableCellRendererDecorator {
  return (constructor: TableCellRendererConstructor): void => {
    constructor.type = tableCellRendererMetadata.type;
    constructor.alignment = tableCellRendererMetadata.alignment;
  };
}

export const TABLE_CELL_RENDERER_COLUMN_CONFIG: InjectionToken<TableColumnConfig> = new InjectionToken(
  'TABLE_CELL_RENDERER_COLUMN_CONFIG'
);
export const TABLE_CELL_RENDERER_COLUMN_INDEX: InjectionToken<TableColumnConfig> = new InjectionToken(
  'TABLE_CELL_RENDERER_COLUMN_INDEX'
);
export const TABLE_CELL_RENDERER_CELL_DATA: InjectionToken<unknown> = new InjectionToken(
  'TABLE_CELL_RENDERER_CELL_DATA'
);
export const TABLE_CELL_RENDERER_ROW_DATA: InjectionToken<unknown> = new InjectionToken('TABLE_CELL_RENDERER_ROW_DATA');
