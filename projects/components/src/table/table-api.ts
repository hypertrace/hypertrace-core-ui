import { Dictionary } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { TableCellAlignmentType } from './renderers/table-cell-alignment-type';

export interface TableColumnConfig {
  field: string;
  title?: string;
  titleTooltip?: string;
  renderer?: string;
  sort?: TableSortDirection;
  visible?: boolean;
  sortable?: boolean;
  alignment?: TableCellAlignmentType;
  width?: number | string;
  onClick?(row: TableRow, column: TableColumnConfig): void;
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
  // These values are used in css
  None = 'none',
  Single = 'single'
}
