import { Directive, Inject, OnInit } from '@angular/core';
import { TableColumnConfig, TableRow } from '../table-api';
import { StandardTableCellRendererType } from './standard-table-cell-renderer-type';
import { TableCellAlignmentType } from './table-cell-alignment-type';
import {
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from './table-cell-renderer';

@Directive() // Angular 9 Requires superclasses to be annotated as well in order to resolve injectables for constructor
// tslint:disable-next-line:directive-class-suffix
export abstract class TableCellRendererComponent<TCellData, TValue = TCellData> implements OnInit {
  public static readonly type: StandardTableCellRendererType;
  public static readonly alignment: TableCellAlignmentType;

  private _value!: TValue;
  private _units!: string;
  private _tooltip!: string;
  public readonly clickable: boolean = false;
  public readonly isFirstColumn: boolean = false;

  public constructor(
    @Inject(TABLE_CELL_RENDERER_COLUMN_CONFIG) private readonly columnConfig: TableColumnConfig,
    @Inject(TABLE_CELL_RENDERER_COLUMN_INDEX) private readonly index: number,
    @Inject(TABLE_CELL_RENDERER_ROW_DATA) private readonly rowData: TableRow,
    @Inject(TABLE_CELL_RENDERER_CELL_DATA) private readonly cellData: TCellData
  ) {
    this.clickable = this.columnConfig.onClick !== undefined;
    this.isFirstColumn = this.index === 0;
  }

  public ngOnInit(): void {
    this.initialize();
  }

  public initialize(): void {
    this._value = this.parseValue(this.cellData, this.rowData);
    this._units = this.parseUnits(this.cellData, this.rowData);
    this._tooltip = this.parseTooltip(this.cellData, this.rowData);
  }

  protected abstract parseValue(cellData: TCellData, rowData?: TableRow): TValue;

  protected parseUnits(_cellData: TCellData, _rowData?: TableRow): string {
    return '';
  }

  protected parseTooltip(_cellData: TCellData, _rowData?: TableRow): string {
    return `${this._value as string} ${this._units}`.trim();
  }

  public onClick(): void {
    this.columnConfig.onClick && this.columnConfig.onClick(this.rowData, this.columnConfig);
  }

  public get value(): TValue {
    return this._value;
  }

  public get units(): string {
    return this._units;
  }

  public get tooltip(): string {
    return this._tooltip;
  }
}
