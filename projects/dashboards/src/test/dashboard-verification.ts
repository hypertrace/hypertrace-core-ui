import { NavigationService, TimeRangeService } from '@hypertrace/common';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelJson } from '@hypertrace/hyperdash';
import { DashboardManagerService } from '@hypertrace/hyperdash-angular';
import { mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

export const isValidDashboard = (
  spectator: Spectator<unknown>,
  definition: ModelJson | { json: ModelJson }
): boolean => {
  const json = 'json' in definition ? definition.json : definition;
  try {
    spectator.inject(DashboardManagerService).create(json);

    return true;
  } catch {
    return false;
  }
};

export const mockDashboardProviders = [
  mockProvider(GraphQlRequestService),
  mockProvider(TimeRangeService),
  mockProvider(NavigationService, {
    getAllValuesForQueryParameter: () => []
  }),
  mockProvider(MetadataService, {
    getFilterAttributes: () => of([])
  })
];
