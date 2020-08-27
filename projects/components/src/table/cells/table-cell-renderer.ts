import { Type } from '@angular/core';
import { TableCellRendererComponent } from './table-cell-renderer.component';
import { TableCellAlignmentType } from './types/table-cell-alignment-type';

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
