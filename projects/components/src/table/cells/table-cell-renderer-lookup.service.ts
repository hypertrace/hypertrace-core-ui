import { Injectable, Injector } from '@angular/core';
import { TableColumnConfig, TableRow } from '../table-api';
import {
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_ROW_DATA
} from './table-cell-injection-tokens';
import { TableCellRendererConstructor } from './table-cell-renderer';

@Injectable({
  providedIn: 'root'
})
export class TableCellRendererLookupService {
  private readonly renderers: Map<string, TableCellRendererConstructor> = new Map();

  public register(renderer: TableCellRendererConstructor): void {
    this.renderers.set(renderer.type, renderer);
  }

  public registerAll(renderers: TableCellRendererConstructor[]): void {
    renderers.forEach(renderer => {
      this.register(renderer);
    });
  }

  public lookup(type: string): TableCellRendererConstructor {
    if (!this.renderers.has(type)) {
      throw Error(`Table cell parser of type '${type}' not registered.`);
    }

    return this.renderers.get(type)!;
  }

  public createInjector(
    columnConfig: TableColumnConfig,
    index: number,
    cellData: unknown,
    row: TableRow,
    injector: Injector
  ): Injector {
    return Injector.create({
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
  }
}
