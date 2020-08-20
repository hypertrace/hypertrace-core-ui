import { Injectable } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { FilterAttribute } from '../filter-bar/filter-attribute';
import { FilterBuilderService } from '../filter-bar/filter/builder/filter-builder.service';
import { Filter } from '../filter-bar/filter/filter-api';
import { FilterParserService } from '../filter-bar/filter/parser/filter-parser.service';

@Injectable({ providedIn: 'root' })
export class FilterButtonService {
  private static readonly FILTER_QUERY_PARAM: string = 'filter';

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly filterBuilderService: FilterBuilderService,
    private readonly filterParserService: FilterParserService
  ) {}

  public buildAvailableFilters(attribute: FilterAttribute, value: unknown): Filter[] {
    return this.filterBuilderService.lookup(attribute).buildFiltersForAvailableOperators(attribute, value);
  }

  /*
   * TODO: Combine service with filter-bar.service. A few duplicated methods here.
   */

  public applyUrlFilter(attributes: FilterAttribute[], filter: Filter): void {
    const filters = this.getUrlFilters(attributes);

    const foundIndex = filters.findIndex(f => filter.field === f.field);

    if (foundIndex !== -1) {
      filters[foundIndex] = filter;
    } else {
      filters.push(filter);
    }

    this.setUrlFilters([...filters]);
  }

  private setUrlFilters(filters: Filter[]): void {
    this.navigationService.addQueryParametersToUrl({
      [FilterButtonService.FILTER_QUERY_PARAM]: filters.length === 0 ? undefined : filters.map(f => f.urlString)
    });
  }

  private getUrlFilters(attributes: FilterAttribute[]): Filter[] {
    return this.navigationService
      .getAllValuesForQueryParameter(FilterButtonService.FILTER_QUERY_PARAM)
      .map(filterStr => this.parseUrlFilterString(filterStr, attributes))
      .filter((filter): filter is Filter => filter !== undefined);
  }

  private parseUrlFilterString(filterString: string, attributes: FilterAttribute[]): Filter | undefined {
    return this.filterParserService.parseUrlFilterString(filterString, attributes);
  }
}
