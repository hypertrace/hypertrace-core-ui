import { Injectable, Injector } from '@angular/core';
import { LoggerService } from '@hypertrace/common';
import { TableColumnConfig, TableRow } from '../table-api';
import {
  TABLE_CELL_RENDERER_CELL_DATA,
  TABLE_CELL_RENDERER_COLUMN_CONFIG,
  TABLE_CELL_RENDERER_COLUMN_INDEX,
  TABLE_CELL_RENDERER_ROW_DATA
} from './table-cell-injection-tokens';
import { TableCellRendererConstructor } from './table-cell-renderer';

@Injectable({
  providedIn: 'root'
})
export class TableCellRendererLookupService {
  private defaultRenderer?: TableCellRendererConstructor;

  private readonly renderers: Map<string, TableCellRendererConstructor> = new Map();

  public constructor(private readonly loggerService: LoggerService) {}

  public register(renderer: TableCellRendererConstructor, isDefault: boolean = false): void {
    this.renderers.set(renderer.type, renderer);

    if (isDefault || this.renderers.size === 1) {
      this.defaultRenderer = renderer;
    }
  }

  public registerAll(renderers: TableCellRendererConstructor[], defaultRenderer?: TableCellRendererConstructor): void {
    renderers.forEach(renderer => {
      this.register(renderer, renderer === defaultRenderer);
    });
  }

  public lookup(type: string | undefined): TableCellRendererConstructor {
    if (type === undefined) {
      return this.defaultOrError();
    }

    if (!this.renderers.has(type)) {
      this.loggerService.warn(`Table cell renderer by the name '${type}' not found. Using default.`);

      return this.defaultOrError();
    }

    return this.renderers.get(type)!;
  }

  private defaultOrError(): TableCellRendererConstructor {
    if (this.defaultRenderer === undefined) {
      throw new Error(`No default table cell renderer set`);
    }

    return this.defaultRenderer;
  }

  public createInjector(
    columnConfig: TableColumnConfig,
    index: number,
    value: unknown,
    row: TableRow,
    injector: Injector
  ): Injector {
    return Injector.create({
      providers: [
        {
          provide: TABLE_CELL_RENDERER_COLUMN_CONFIG,
          useValue: columnConfig
        },
        {
          provide: TABLE_CELL_RENDERER_COLUMN_INDEX,
          useValue: index
        },
        {
          provide: TABLE_CELL_RENDERER_CELL_DATA,
          useValue: value
        },
        {
          provide: TABLE_CELL_RENDERER_ROW_DATA,
          useValue: row
        }
      ],
      parent: injector
    });
  }
}
