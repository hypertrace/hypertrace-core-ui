import { Observable } from 'rxjs';
import { StatefulTableRow, TableColumnConfig, TableMode, TableRow, TableSelectionMode } from '../table-api';
import { TableDataSource } from './table-data-source';

export interface TableDataSourceProvider {
  data?: TableDataSource<TableRow>;
}

export interface ColumnConfigProvider {
  columnConfigs$: Observable<TableColumnConfig[]>;
}

export interface FilterProvider {
  filter$: Observable<string>;
}

export interface ColumnStateChangeProvider {
  columnState$: Observable<TableColumnConfig | undefined>;
}

export interface RowStateChangeProvider {
  rowState$: Observable<StatefulTableRow | undefined>;
  mode?: TableMode;
  selectionMode?: TableSelectionMode;
  initialExpandAll?: boolean;
}
