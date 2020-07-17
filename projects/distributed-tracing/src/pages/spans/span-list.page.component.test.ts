import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import {
  NavigationService,
  RelativeTimeRange,
  SubscriptionLifecycle,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { getMockFlexLayoutProviders } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { FilterBarService } from '../../shared/components/filter-bar/filter-bar.service';
import { GraphQlFilterBuilderService } from '../../shared/services/filter-builder/graphql-filter-builder.service';
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import { SpanListPageComponent } from './span-list.page.component';
import { SpanListPageModule } from './span-list.page.module';

describe('Span List Page Component', () => {
  let spectator: Spectator<SpanListPageComponent>;
  let spyError: jest.SpyInstance;

  const createComponent = createComponentFactory({
    declareComponent: false,
    component: SpanListPageComponent,
    imports: [SpanListPageModule, HttpClientTestingModule],
    componentProviders: [
      mockProvider(SubscriptionLifecycle, {
        add: jest.fn()
      })
    ],
    providers: [
      ...getMockFlexLayoutProviders(),
      mockProvider(FilterBarService, {
        getUrlFilters: jest.fn().mockReturnValue(of([]))
      }),
      mockProvider(GraphQlRequestService),
      mockProvider(Router),
      mockProvider(NavigationService),
      mockProvider(TimeRangeService, {
        getTimeRangeAndChanges: jest.fn().mockReturnValue(of(new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour))))
      }),
      mockProvider(MetadataService, {
        getFilterAttributes: jest.fn().mockReturnValue(of([]))
      }),
      mockProvider(GraphQlFilterBuilderService, {
        buildGraphQlFilters: jest.fn().mockReturnValue([])
      })
    ]
  });

  beforeEach(() => {
    spyError = jest.spyOn(global.console, 'error');
  });

  it('should init dashboard and not log any errors', () => {
    spectator = createComponent();

    expect(spectator.query('htc-filter-bar')).toExist();
    expect(spectator.query('htc-navigable-dashboard')).toExist();
    expect(spectator.component.dashboard).toBeDefined();
    expect(spectator.inject(GraphQlFilterBuilderService).buildGraphQlFilters).toHaveBeenCalled();

    // If the ModelJson has an error in the 'type' string it logs a message
    expect(spyError).not.toHaveBeenCalled();
  });
});
