import { Injectable } from '@angular/core';
import { TableCellParserConstructor } from './table-cell-parser';

@Injectable({
  providedIn: 'root'
})
export class TableCellParserLookupService {
  private readonly parsers: Map<string, TableCellParserConstructor<unknown, unknown, unknown>> = new Map();

  public register(parser: TableCellParserConstructor<unknown, unknown, unknown>): void {
    this.parsers.set(parser.type, parser);
  }

  public registerAll(renderers: TableCellParserConstructor<unknown, unknown, unknown>[]): void {
    renderers.forEach(renderer => {
      this.register(renderer);
    });
  }

  public lookup<C, V, F>(type: string): TableCellParserConstructor<C, V, F> {
    if (!this.parsers.has(type)) {
      throw Error(`Table cell parser of type '${type}' not registered.`);
    }

    return this.parsers.get(type)! as TableCellParserConstructor<C, V, F>;
  }
}
