import { Injectable } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { KeyValueFilter } from './filters/key-value/key-value-filter';
import { NumericFilter } from './filters/numeric/numeric-filter';
import { Filter } from './model/filter';
import { FilterType } from './model/filter-type';

@Injectable({
  providedIn: 'root'
})
export class FilterPersistenceService {
  private readonly FILTER_REGEX: RegExp = /([^-]+)-(.*)$/;
  private readonly FILTER_QUERY_PARAM: string = 'filter';

  private readonly filterTypeMap: Map<FilterType, FilterDeserializationConfig> = new Map();

  public constructor(private readonly navigationService: NavigationService) {
    // TODO better solution
    this.registerFilterType(FilterType.KeyValue, KeyValueFilter.forContentString);
    this.registerFilterType(FilterType.Numeric, NumericFilter.forContentString);
  }

  public registerFilterType(type: FilterType, fromContentString: (contentString: string) => Filter): void {
    if (this.filterTypeMap.has(type)) {
      throw new Error(`FilterBuilderService attempting to re-register exiting type: ${type}`);
    }

    this.filterTypeMap.set(type, {
      type: type,
      fromContentString: fromContentString
    });
  }

  public addFiltersToUrl(filters: Filter[]): void {
    if (filters.length === 0) {
      return;
    }
    // Should we merge with existing url filters?
    this.navigationService.addQueryParametersToUrl({
      [this.FILTER_QUERY_PARAM]: filters.map(filter => this.filterToUrlString(filter))
    });
  }

  public getFiltersFromUrl(): Filter[] {
    return this.navigationService
      .getAllValuesForQueryParameter(this.FILTER_QUERY_PARAM)
      .map(singleFilterUrlString => this.filterFromUrlString(singleFilterUrlString));
  }

  public getFiltersFromString(filterString: string): Filter[] {
    if (filterString.length === 0) {
      return [];
    }

    return filterString.split('&').map(singleFilterUrlString => this.filterFromUrlString(singleFilterUrlString));
  }

  public filtersToString(filters: Filter[]): string {
    return filters.map(filter => this.filterToUrlString(filter)).join('&');
  }

  private filterFromUrlString(urlString: string): Filter {
    const decoded = decodeURIComponent(urlString);
    const segments = this.FILTER_REGEX.exec(decoded);
    if (!segments || segments.length !== 3) {
      throw new Error(`FilterBuilderService unparseable filter URL string: ${urlString}`);
    }

    const type = segments[1] as FilterType;
    const contents = segments[2];

    if (!this.filterTypeMap.has(type)) {
      throw new Error(`FilterBuilderService no registered filter type matching: ${type}`);
    }

    return this.filterTypeMap.get(type)!.fromContentString(contents);
  }

  private filterToUrlString(filter: Filter): string {
    return encodeURIComponent(`${filter.type}-${filter.contentsAsString()}`);
  }
}

interface FilterDeserializationConfig {
  type: FilterType;
  fromContentString(contentString: string): Filter;
}
