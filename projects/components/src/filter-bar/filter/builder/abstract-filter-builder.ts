import { assertUnreachable, collapseWhitespace } from '@hypertrace/common';
import { FilterAttribute } from '../../filter-attribute';
import { Filter, UrlFilterOperator, UserFilterOperator } from '../filter-api';

export abstract class AbstractFilterBuilder<T> {
  public abstract convertValue(value: unknown): T;
  public abstract convertValueToString(value: unknown): string;
  public abstract supportedValue(): string;
  public abstract supportedOperators(): UserFilterOperator[];

  public buildFiltersForAvailableOperators(attribute: FilterAttribute): Filter<T>[] {
    return this.supportedOperators().map(operator => this.buildFilter(attribute, operator));
  }

  public buildFilter(attribute: FilterAttribute, operator: UserFilterOperator, value?: T): Filter<T> {
    return {
      metadata: attribute,
      field: attribute.name,
      operator: operator,
      value: this.convertValue(value),
      userString: this.buildUserFilterString(attribute, operator, value),
      urlString: this.buildUrlFilterString(attribute, this.toUrlFilterOperator(operator), value)
    };
  }

  public buildUserFilterString(attribute: FilterAttribute, operator?: UserFilterOperator, value?: unknown): string {
    return collapseWhitespace(
      `${attribute.displayName} ${operator !== undefined ? operator : ''} ${this.convertValueToString(value)}`
    ).trim();
  }

  protected buildUrlFilterString(attribute: FilterAttribute, operator: UrlFilterOperator, value: unknown): string {
    return encodeURIComponent(`${attribute.name}${operator}${this.convertValueToString(value)}`);
  }

  private toUrlFilterOperator(operator: UserFilterOperator): UrlFilterOperator {
    switch (operator) {
      case UserFilterOperator.Equals:
        return UrlFilterOperator.Equals;
      case UserFilterOperator.NotEquals:
        return UrlFilterOperator.NotEquals;
      case UserFilterOperator.LessThan:
        return UrlFilterOperator.LessThan;
      case UserFilterOperator.LessThanOrEqualTo:
        return UrlFilterOperator.LessThanOrEqualTo;
      case UserFilterOperator.GreaterThan:
        return UrlFilterOperator.GreaterThan;
      case UserFilterOperator.GreaterThanOrEqualTo:
        return UrlFilterOperator.GreaterThanOrEqualTo;
      case UserFilterOperator.ContainsKey:
        return UrlFilterOperator.ContainsKey;
      case UserFilterOperator.ContainsKeyValue:
        return UrlFilterOperator.ContainsKeyValue;
      default:
        return assertUnreachable(operator);
    }
  }
}
