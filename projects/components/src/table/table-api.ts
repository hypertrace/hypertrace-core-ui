import { Dictionary } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { FilterAttribute } from '../filter-bar/filter-attribute';
import { TableCellParserBase } from './cells/table-cell-parser-base';
import { TableCellRendererConstructor } from './cells/table-cell-renderer';
import { TableCellAlignmentType } from './cells/types/table-cell-alignment-type';

export interface TableColumnConfig {
  field: string; // This is the unique name for the column (usually same as name except for composite fields)
  name?: string; // Attribute name (for composite fields this should be the filterable attribute)
  display?: string;
  title?: string;
  titleTooltip?: string;
  sort?: TableSortDirection;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  alignment?: TableCellAlignmentType;
  width?: number | string;
  onClick?(row: TableRow, column: TableColumnConfig): void;
}

export interface TableColumnConfigExtended extends TableColumnConfig {
  attribute?: FilterAttribute; // Undefined if we can't determine scope yet (e.g. Interactions)
  renderer: TableCellRendererConstructor;
  parser: TableCellParserBase<unknown, unknown, unknown>;
  filterValues: unknown[];
}

export type TableRow = Dictionary<unknown>;

export interface TreeTableRow extends TableRow {
  getChildren(): Observable<TreeTableRow[]>;
}

export interface StatefulTableRow extends TableRow {
  $$state: TableRowState;
}

export interface StatefulTreeTableRow extends TreeTableRow {
  $$state: TableRowState;
}

export interface StatefulPrefetchedTreeTableRow extends TreeTableRow {
  $$state: PrefetchedTableRowState;
}

export interface TableRowState {
  parent?: StatefulTableRow;
  children?: StatefulPrefetchedTreeTableRow[];
  expanded: boolean;
  selected: boolean;
  root: boolean;
  leaf: boolean;
  depth: number;
}

export interface PrefetchedTableRowState extends TableRowState {
  parent?: StatefulPrefetchedTreeTableRow;
  children: StatefulPrefetchedTreeTableRow[];
}

export interface RowStateChange {
  cached: StatefulTableRow; // This is the previously cached row
  changed: StatefulTableRow | undefined; // This is populated if there is a change for this row or an ancestor
}

export const enum TableSortDirection {
  // These values are used in css
  Ascending = 'ASC',
  Descending = 'DESC'
}

export const enum TableMode {
  // These values are used in css
  Flat = 'flat',
  Detail = 'detail',
  Tree = 'tree'
}

export const enum TableStyle {
  // These values are used in css
  FullPage = 'full-page',
  Embedded = 'embedded',
  List = 'list'
}

export const enum TableSelectionMode {
  None = 'none',
  Single = 'single',
  Multiple = 'multiple'
}
