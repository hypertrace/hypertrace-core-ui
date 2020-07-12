import { Type } from '@angular/core';
import { Filter } from './filter';

export class FilterCollection<K> {
  public constructor(private readonly config: FilterCollectionConfig<K>) {}

  public set(key: K, filter: Filter): FilterCollection<K> {
    const newFilters = new Map(this.config.currentFilters);
    newFilters.set(key, filter);

    return new FilterCollection({
      ...this.config,
      currentFilters: newFilters
    });
  }

  public remove(key: K): FilterCollection<K> {
    const newFilters = new Map(this.config.currentFilters);
    newFilters.delete(key);

    return new FilterCollection({
      ...this.config,
      currentFilters: newFilters
    });
  }

  public get(key: K): Filter | undefined {
    return this.config.currentFilters.get(key);
  }

  public has(key: K): boolean {
    return !!this.get(key);
  }

  public getAllAllowedFilters(): K[] {
    return [...this.config.allowedFilters];
  }

  public getCurrentAllowedFilters(): K[] {
    return this.config.allowedFilters.filter(key => !this.has(key));
  }

  public getCurrentFilters(): Map<K, Filter> {
    return new Map(this.config.currentFilters);
  }
}

/*
For something like service name, what does that look like?
Is it a KV filter which we define with a key of serviceName?
If so, the filter builder doesn't really know anything about it, that's more of a collection detail. In
 fact that might mean we don't really register filters other than building a filter collection...
 Also means that our keys aren't really unique (in terms of looking up deser function)
*/
export interface FilterCollectionConfig<K> {
  allowedFilters: ReadonlyArray<K>;
  currentFilters: ReadonlyMap<K, Filter>;
}

export interface FilterConfig {
  renderer?: Type<unknown>;
  displayName: string;
  defaultValue(): Filter;
}
