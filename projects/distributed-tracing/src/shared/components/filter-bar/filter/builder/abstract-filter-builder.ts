import { assertUnreachable, collapseWhitespace } from '@hypertrace/common';
import { AttributeMetadata, AttributeMetadataType } from '../../../../graphql/model/metadata/attribute-metadata';
import { Filter, UrlFilterOperator, UserFilterOperator } from '../filter-api';

export abstract class AbstractFilterBuilder<T> {
  public abstract convertValue(value: unknown): T;
  public abstract convertValueToString(value: unknown): string;
  public abstract supportedValue(): AttributeMetadataType;
  public abstract supportedOperators(): UserFilterOperator[];

  public buildFiltersForAvailableOperators(metadata: AttributeMetadata): Filter<T>[] {
    return this.supportedOperators().map(operator => this.buildFilter(metadata, operator));
  }

  public buildFilter(metadata: AttributeMetadata, operator: UserFilterOperator, value?: T): Filter<T> {
    return {
      metadata: metadata,
      field: metadata.name,
      operator: operator,
      value: this.convertValue(value),
      userString: this.buildUserFilterString(metadata, operator, value),
      urlString: this.buildUrlFilterString(metadata, this.toUrlFilterOperator(operator), value)
    };
  }

  public buildUserFilterString(metadata: AttributeMetadata, operator?: UserFilterOperator, value?: unknown): string {
    return collapseWhitespace(
      `${metadata.displayName} ${operator !== undefined ? operator : ''} ${this.convertValueToString(value)}`
    ).trim();
  }

  protected buildUrlFilterString(metadata: AttributeMetadata, operator: UrlFilterOperator, value: unknown): string {
    return encodeURIComponent(`${metadata.name}${operator}${this.convertValueToString(value)}`);
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
