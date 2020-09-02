import { Injectable } from '@angular/core';
import { TableCellRendererConstructor } from './table-cell-renderer';

@Injectable({
  providedIn: 'root'
})
export class TableCellRendererLookupService {
  private readonly renderers: Map<string, TableCellRendererConstructor> = new Map();

  public register(...renderers: TableCellRendererConstructor[]): void {
    renderers.forEach(renderer => {
      this.renderers.set(renderer.type, renderer);
    });
  }

  public lookup(type: string): TableCellRendererConstructor {
    if (!this.renderers.has(type)) {
      throw Error(`Table cell parser of type '${type}' not registered.`);
    }

    return this.renderers.get(type)!;
  }
}
