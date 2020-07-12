import { Directive, Inject, OnInit, Optional } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { TableColumnConfig } from '../table-api';
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
export abstract class TableCellRendererComponent<TRaw, TParsed = TRaw> implements OnInit {
  public static readonly type: StandardTableCellRendererType;
  public static readonly alignment: TableCellAlignmentType;

  private _value!: TParsed;
  public readonly clickable: boolean = false;
  public readonly isFirstColumn: boolean = false;

  protected abstract parseValue(cellData?: TRaw, rowData?: Dictionary<unknown>): TParsed;

  public constructor(
    @Inject(TABLE_CELL_RENDERER_COLUMN_CONFIG) private readonly columnConfig: TableColumnConfig,
    @Inject(TABLE_CELL_RENDERER_COLUMN_INDEX) private readonly index: number,
    @Optional() @Inject(TABLE_CELL_RENDERER_CELL_DATA) private readonly cellData: TRaw | null,
    @Optional() @Inject(TABLE_CELL_RENDERER_ROW_DATA) private readonly rowData: Dictionary<unknown> | null
  ) {
    this.clickable = this.columnConfig.onClick !== undefined;
    this.isFirstColumn = this.index === 0;
  }

  public ngOnInit(): void {
    this._value = this.parseValue(this.cellData ?? undefined, this.rowData ?? undefined);
  }

  public get value(): TParsed {
    return this._value;
  }
}
