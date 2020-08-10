import { Injectable } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { FilterAttribute } from './filter-attribute';
import { Filter } from './filter/filter-api';
import { FilterParserService } from './filter/parser/filter-parser.service';

@Injectable({ providedIn: 'root' })
export class FilterBarService {
  private static readonly FILTER_QUERY_PARAM: string = 'filter';

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly filterParserService: FilterParserService
  ) {}

  public setUrlFilters(filters: Filter[]): void {
    this.navigationService.addQueryParametersToUrl({
      [FilterBarService.FILTER_QUERY_PARAM]: filters.length === 0 ? undefined : filters.map(f => f.urlString)
    });
  }

  public getUrlFilters(attributes: FilterAttribute[]): Filter[] {
    return this.navigationService
      .getAllValuesForQueryParameter(FilterBarService.FILTER_QUERY_PARAM)
      .map(filterStr => this.parseUrlFilterString(filterStr, attributes))
      .filter((filter): filter is Filter => filter !== undefined);
  }

  private parseUrlFilterString(filterString: string, attributes: FilterAttribute[]): Filter | undefined {
    return this.filterParserService.parseUrlFilterString(filterString, attributes);
  }
}
