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
  String = 'STRING',
  Number = 'LONG',
  StringMap = 'STRING_MAP',
  Timestamp = 'TIMESTAMP'
}
