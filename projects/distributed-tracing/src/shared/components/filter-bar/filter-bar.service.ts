import { Injectable } from '@angular/core';
import { forkJoinSafeEmpty, NavigationService } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { filter, flatMap } from 'rxjs/operators';
import { MetadataService } from '../../services/metadata/metadata.service';
import { Filter } from './filter/filter-api';
import { FilterParserService } from './filter/parser/filter-parser.service';

@Injectable({ providedIn: 'root' })
export class FilterBarService {
  private static readonly FILTER_QUERY_PARAM: string = 'filter';

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly metadataService: MetadataService,
    private readonly filterParserService: FilterParserService
  ) {}

  public setUrlFilters(filters: Filter[]): void {
    this.navigationService.addQueryParametersToUrl({
      [FilterBarService.FILTER_QUERY_PARAM]: filters.length === 0 ? undefined : filters.map(f => f.urlString)
    });
  }

  public getUrlFilters(scope: string): Observable<Filter[]> {
    return forkJoinSafeEmpty(
      this.navigationService
        .getAllValuesForQueryParameter(FilterBarService.FILTER_QUERY_PARAM)
        .map(filterStr => this.parseUrlFilterString(filterStr, scope))
    );
  }

  private parseUrlFilterString(filterString: string, scope: string): Observable<Filter> {
    return this.metadataService.getFilterAttributes(scope).pipe(
      flatMap(attributes =>
        // Filter out any attribute that is not a substring of the filter string.
        // Further matching of attributes against filter string tokens happens downstream.
        attributes
          .filter(attribute => filterString.includes(attribute.name))
          .flatMap(attribute => this.filterParserService.parseUrlFilterString(filterString, attribute))
      ),
      filter((parsedFilter): parsedFilter is Filter => parsedFilter !== undefined)
    );
  }
}
