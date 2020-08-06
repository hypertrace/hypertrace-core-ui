import { MetricAggregationType } from '../metrics/metric-aggregation';

export interface AttributeMetadata {
  name: string;
  displayName: string;
  units: string;
  type: AttributeMetadataType;
  scope: string;
  requiresAggregation: boolean;
  allowedAggregations: MetricAggregationType[];
  groupable: boolean;
}

export const enum AttributeMetadataType {
  // Duplicated for FilterType in filter-type.ts
  String = 'STRING',
  Number = 'LONG',
  StringMap = 'STRING_MAP',
  Timestamp = 'TIMESTAMP'
}
