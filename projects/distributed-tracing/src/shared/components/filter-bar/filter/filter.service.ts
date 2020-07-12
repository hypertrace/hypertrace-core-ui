import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttributeMetadata } from '../../../graphql/model/metadata/attribute-metadata';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { FilterBuilderService } from './builder/filter-builder.service';
import { USER_FILTER_OPERATORS, UserFilterOperator } from './filter-api';
import { FilterParserService } from './parser/filter-parser.service';

export interface IncompleteFilter {
  metadata: AttributeMetadata;
  field: string;
  operator?: UserFilterOperator;
  value?: unknown;
  userString: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public constructor(
    private readonly metadataService: MetadataService,
    private readonly filterBuilderService: FilterBuilderService,
    private readonly filterParserService: FilterParserService
  ) {}

  public lookupAvailableMatchingFilters(scope: string, text: string = ''): Observable<IncompleteFilter[]> {
    return this.getFilterableAttributes(scope).pipe(
      map(attributes => this.mapToFilters(text, attributes)),
      map(filters => this.filterByText(text, filters))
    );
  }

  private getFilterableAttributes(scope: string): Observable<AttributeMetadata[]> {
    return this.metadataService.getFilterAttributes(scope).pipe(map(attributes => this.filterByType(attributes)));
  }

  private filterByType(attributes: AttributeMetadata[]): AttributeMetadata[] {
    return attributes.filter(attribute => this.filterBuilderService.isSupportedType(attribute));
  }

  private filterByText(text: string, filters: IncompleteFilter[]): IncompleteFilter[] {
    return filters.filter(
      filter =>
        this.parseUserInput(text, filter.metadata) !== undefined ||
        filter.userString.toLowerCase().includes(text.toLowerCase())
    );
  }

  private mapToFilters(text: string, attributes: AttributeMetadata[]): IncompleteFilter[] {
    return attributes.flatMap(attribute => {
      const filterBuilder = this.filterBuilderService.lookup(attribute);

      const filter = this.parseUserInput(text, attribute);
      if (filter === undefined) {
        // This means user text does not include a full field yet, so just return all attributes that matched
        return {
          metadata: attribute,
          field: attribute.name,
          userString: this.filterBuilderService.lookup(attribute).buildUserFilterString(attribute)
        };
      }

      if (filter.operator !== undefined) {
        // This means we have a partially built filter, including at least an operator and maybe value
        return filterBuilder.buildFilter(attribute, filter.operator, filter.value);
      }

      // Only have a match for the field, so build options for each possible operator
      return filterBuilder.buildFiltersForAvailableOperators(attribute);
    });
  }

  private parseUserInput(text: string, attribute: AttributeMetadata): IncompleteFilter | undefined {
    // First check to see if we have a complete filter string
    const filter = this.filterParserService.parseUserFilterString(text, attribute);

    if (filter !== undefined) {
      // Full filter with key, operator, and value found
      return filter;
    }

    /*
     * Not a complete filter string, so let's see how much we do have
     */

    const operator = USER_FILTER_OPERATORS.find(op => this.textIsOnlyFieldAndOperator(text, attribute, op) ?? op);

    if (operator !== undefined) {
      // Partial filter with key and operator found
      return {
        metadata: attribute,
        field: attribute.name,
        operator: operator,
        userString: this.filterBuilderService.lookup(attribute).buildUserFilterString(attribute, operator)
      };
    }

    if (this.textIsOnlyField(text, attribute)) {
      // Partial filter with only key found
      return {
        metadata: attribute,
        field: attribute.name,
        userString: this.filterBuilderService.lookup(attribute).buildUserFilterString(attribute)
      };
    }

    return undefined;
  }

  private textIsOnlyField(text: string, attribute: AttributeMetadata): boolean {
    return text.trim().toLowerCase() === attribute.displayName.toLowerCase();
  }

  private textIsOnlyFieldAndOperator(
    text: string,
    attribute: AttributeMetadata,
    operator: UserFilterOperator
  ): boolean {
    const filterBuilder = this.filterBuilderService.lookup(attribute);

    return text.trim().toLowerCase() === filterBuilder.buildFilter(attribute, operator).userString.toLowerCase();
  }
}
