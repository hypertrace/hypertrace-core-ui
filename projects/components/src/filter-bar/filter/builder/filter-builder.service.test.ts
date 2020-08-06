import { FilterAttribute } from '@hypertrace/components';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { FilterBuilderService } from './filter-builder.service';
import { NumberFilterBuilder } from './number-filter-builder';
import { StringFilterBuilder } from './string-filter-builder';

describe('Filter Builder service', () => {
  let spectator: SpectatorService<FilterBuilderService>;

  const attributes: FilterAttribute[] = [
    {
      name: 'calls',
      displayName: 'Calls',
      units: '',
      type: 'LONG',
      scope: 'TRACE_SCOPE',
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: 'LONG',
      scope: 'TRACE_SCOPE',
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'name',
      displayName: 'Name',
      units: '',
      type: 'STRING',
      scope: 'TRACE_SCOPE',
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'endTime',
      displayName: 'End Time',
      units: '',
      type: 'TIMESTAMP',
      scope: 'TRACE_SCOPE',
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'tags',
      displayName: 'Tags',
      units: '',
      type: 'STRING_MAP',
      scope: 'TRACE_SCOPE',
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    }
  ];

  const buildService = createServiceFactory({
    service: FilterBuilderService
  });

  beforeEach(() => {
    spectator = buildService();

    spectator.service.registerAll([NumberFilterBuilder, StringFilterBuilder]);
  });

  test('correctly looks up registered filter builders', () => {
    expect(spectator.service.lookup(attributes[0])).toEqual(expect.any(NumberFilterBuilder));
    expect(spectator.service.lookup(attributes[2])).toEqual(expect.any(StringFilterBuilder));
  });

  test('correctly identify supported types', () => {
    expect(spectator.service.isSupportedType(attributes[0])).toEqual(true);
    expect(spectator.service.isSupportedType(attributes[2])).toEqual(true);
    expect(spectator.service.isSupportedType(attributes[3])).toEqual(false);
    expect(spectator.service.isSupportedType(attributes[4])).toEqual(false);
  });
});
