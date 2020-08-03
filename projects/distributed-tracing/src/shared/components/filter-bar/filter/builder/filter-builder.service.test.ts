import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { AttributeMetadata, AttributeMetadataType } from '../../../../graphql/model/metadata/attribute-metadata';
import { TRACE_SCOPE } from '../../../../graphql/model/schema/trace';
import { FilterBuilderService } from './filter-builder.service';
import { NumberFilterBuilder } from './number-filter-builder';
import { StringFilterBuilder } from './string-filter-builder';

describe('Filter Builder service', () => {
  let spectator: SpectatorService<FilterBuilderService>;

  const attributes: AttributeMetadata[] = [
    {
      name: 'calls',
      displayName: 'Calls',
      units: '',
      type: AttributeMetadataType.Number,
      scope: TRACE_SCOPE,
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: AttributeMetadataType.Number,
      scope: TRACE_SCOPE,
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'name',
      displayName: 'Name',
      units: '',
      type: AttributeMetadataType.String,
      scope: TRACE_SCOPE,
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'endTime',
      displayName: 'End Time',
      units: '',
      type: AttributeMetadataType.Timestamp,
      scope: TRACE_SCOPE,
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'tags',
      displayName: 'Tags',
      units: '',
      type: AttributeMetadataType.StringMap,
      scope: TRACE_SCOPE,
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
