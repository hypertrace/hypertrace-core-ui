import { Injectable } from '@angular/core';
import { assertUnreachable } from '@hypertrace/common';
import { AttributeMetadata } from '../../../../graphql/model/metadata/attribute-metadata';
import { FilterBuilderService } from '../builder/filter-builder.service';
import {
  Filter,
  URL_FILTER_OPERATORS,
  UrlFilterOperator,
  USER_FILTER_OPERATORS,
  UserFilterOperator
} from '../filter-api';

interface ParsedFilter {
  metadata: AttributeMetadata;
  field: string;
  operator?: string;
  value?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class FilterParserService {
  public constructor(private readonly filterBuilderService: FilterBuilderService) {}

  public parseUserFilterString(filterString: string, attribute: AttributeMetadata): Filter | undefined {
    const parsed = this.parseFilterString(filterString, attribute, USER_FILTER_OPERATORS, attribute.displayName);

    if (parsed === undefined) {
      return undefined;
    }

    return this.filterBuilderService
      .lookup(attribute)
      .buildFilter(attribute, parsed.operator as UserFilterOperator, parsed.value);
  }

  public parseUrlFilterString(filterString: string, attribute: AttributeMetadata): Filter | undefined {
    const parsed = this.parseFilterString(
      decodeURIComponent(filterString),
      attribute,
      URL_FILTER_OPERATORS,
      attribute.name
    );

    if (parsed === undefined) {
      return undefined;
    }

    return this.filterBuilderService
      .lookup(attribute)
      .buildFilter(attribute, this.toUserFilterOperator(parsed.operator as UrlFilterOperator), parsed.value);
  }

  private parseFilterString(
    filterString: string,
    attribute: AttributeMetadata,
    availableOperators: string[],
    attributeMatchString: string
  ): ParsedFilter | undefined {
    const matchingOperator = availableOperators
      .sort((o1: string, o2: string) => o2.length - o1.length) // Check multichar ops first
      .find((operator: string) => filterString.includes(operator));

    if (matchingOperator === undefined) {
      return undefined;
    }

    const split = filterString.split(matchingOperator).map(t => t.trim());
    const parts = [split[0], matchingOperator, split[1]].filter((part: string | undefined) => (part ?? '').length > 0);

    if (parts.length < 3 || parts[0].trim().toLowerCase() !== attributeMatchString.toLowerCase()) {
      // Doesn't contain complete filter of key, op, and value OR is the wrong field
      return undefined;
    }

    return {
      metadata: attribute,
      field: attribute.name,
      operator: parts[1],
      value: parts[2]
    };
  }

  private toUserFilterOperator(operator: UrlFilterOperator): UserFilterOperator {
    switch (operator) {
      case UrlFilterOperator.Equals:
        return UserFilterOperator.Equals;
      case UrlFilterOperator.NotEquals:
        return UserFilterOperator.NotEquals;
      case UrlFilterOperator.LessThan:
        return UserFilterOperator.LessThan;
      case UrlFilterOperator.LessThanOrEqualTo:
        return UserFilterOperator.LessThanOrEqualTo;
      case UrlFilterOperator.GreaterThan:
        return UserFilterOperator.GreaterThan;
      case UrlFilterOperator.GreaterThanOrEqualTo:
        return UserFilterOperator.GreaterThanOrEqualTo;
      case UrlFilterOperator.ContainsKey:
        return UserFilterOperator.ContainsKey;
      case UrlFilterOperator.ContainsKeyValue:
        return UserFilterOperator.ContainsKeyValue;
      default:
        return assertUnreachable(operator);
    }
  }
}
