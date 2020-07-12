import { fakeAsync, flush } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import {
  AttributeMetadata,
  AttributeMetadataType,
  Filter,
  FilterBarService,
  MetadataService,
  SPAN_SCOPE,
  UserFilterOperator
} from '@hypertrace/distributed-tracing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { NumberFilterBuilder } from './filter/builder/number-filter-builder';
import { StringFilterBuilder } from './filter/builder/string-filter-builder';
import { FilterParserService } from './filter/parser/filter-parser.service';

describe('Filter Bar service', () => {
  let spectator: SpectatorService<FilterBarService>;
  let navigationService: NavigationService;

  const attributes: AttributeMetadata[] = [
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: AttributeMetadataType.Number,
      scope: SPAN_SCOPE,
      requiresAggregation: false,
      allowedAggregations: []
    },
    {
      name: 'apiName',
      displayName: 'API Name',
      units: '',
      type: AttributeMetadataType.String,
      scope: SPAN_SCOPE,
      requiresAggregation: false,
      allowedAggregations: []
    }
  ];

  const filters: Filter[] = [
    new NumberFilterBuilder().buildFilter(attributes[0], UserFilterOperator.GreaterThanOrEqualTo, 50),
    new StringFilterBuilder().buildFilter(attributes[1], UserFilterOperator.NotEquals, 'test')
  ];

  const buildService = createServiceFactory({
    service: FilterBarService,
    providers: [
      mockProvider(NavigationService, {
        addQueryParametersToUrl: jest.fn(),
        getAllValuesForQueryParameter: () => ['duration_gte_50']
      }),
      mockProvider(MetadataService, {
        getFilterAttributes: () => of(attributes)
      }),
      mockProvider(FilterParserService, {
        parseUrlFilterString: () => filters[0]
      })
    ]
  });

  beforeEach(() => {
    spectator = buildService();
    navigationService = spectator.inject(NavigationService);
  });

  test('correctly sets filters in url', () => {
    spectator.service.setUrlFilters(filters);

    expect(navigationService.addQueryParametersToUrl).toHaveBeenCalledWith({
      filter: ['duration_gte_50', 'apiName_neq_test']
    });
  });

  test('correctly decodes filters string from url and build filter objects', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.getUrlFilters(SPAN_SCOPE)).toBe('(x|)', {
        x: [filters[0]]
      });
    });
    flush();
  }));

  test('clears filters in url if provided an empty array', () => {
    spectator.service.setUrlFilters([]);

    expect(navigationService.addQueryParametersToUrl).toHaveBeenCalledWith({
      filter: undefined
    });
  });
});
