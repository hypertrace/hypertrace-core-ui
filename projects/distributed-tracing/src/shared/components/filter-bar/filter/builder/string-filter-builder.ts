import { AttributeMetadataType } from '../../../../graphql/model/metadata/attribute-metadata';
import { UserFilterOperator } from '../filter-api';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class StringFilterBuilder extends AbstractFilterBuilder<string | undefined> {
  public convertValue(value: unknown): string | undefined {
    return value === undefined ? undefined : String(value);
  }

  public convertValueToString(value: unknown): string {
    const converted = this.convertValue(value);

    return converted === undefined ? '' : converted;
  }

  public supportedValue(): AttributeMetadataType {
    return AttributeMetadataType.String;
  }

  public supportedOperators(): UserFilterOperator[] {
    return [UserFilterOperator.Equals, UserFilterOperator.NotEquals];
  }
}