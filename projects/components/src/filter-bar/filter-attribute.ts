export interface FilterAttribute {
  name: string;
  displayName: string;
  units: string;
  type: string;
  scope: string;
  requiresAggregation: boolean;
  allowedAggregations: string[];
  groupable: boolean;
}
