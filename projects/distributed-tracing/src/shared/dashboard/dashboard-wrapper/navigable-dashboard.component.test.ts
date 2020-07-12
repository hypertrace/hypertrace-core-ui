import { LoadAsyncModule } from '@hypertrace/components';
import { DashboardPersistenceService } from '@hypertrace/dashboards';
import { AttributeMetadataType } from '@hypertrace/distributed-tracing';
import { Dashboard } from '@hypertrace/hyperdash';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { Filter, UserFilterOperator } from '../../components/filter-bar/filter/filter-api';
import { GraphQlFieldFilter } from '../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlOperatorType } from '../../graphql/model/schema/filter/graphql-filter';
import { GraphQlFilterDataSourceModel } from '../data/graphql/filter/graphql-filter-data-source.model';
import { ApplicationAwareDashboardComponent } from './application-aware-dashboard.component';
import { NavigableDashboardComponent } from './navigable-dashboard.component';

describe('Navigable dashboard component', () => {
  const componentFactory = createComponentFactory({
    component: NavigableDashboardComponent,
    imports: [LoadAsyncModule],
    declarations: [MockComponent(ApplicationAwareDashboardComponent), MockComponent(FilterBarComponent)]
  });

  test('uses default JSON if no dashboard registered', () => {
    const defaultJson = { type: 'my-default-model' };
    const spectator = componentFactory({
      props: {
        defaultJson: defaultJson,
        navLocation: 'my-location'
      }
    });

    expect(spectator.query(ApplicationAwareDashboardComponent)!.json).toBe(defaultJson);
    expect(spectator.query(FilterBarComponent)).not.toExist();
  });

  test('looks up a registered dashboard', () => {
    const registeredJson = { type: 'my-registered-model' };
    const spectator = componentFactory({
      props: {
        navLocation: 'my-location'
      },
      detectChanges: false
    });

    spectator.inject(DashboardPersistenceService).setDefaultForLocation('my-location', { content: registeredJson });
    spectator.detectChanges();

    expect(spectator.query(ApplicationAwareDashboardComponent)!.json).toBe(registeredJson);
  });

  test('prefers a registered dashboard over provided default', () => {
    const registeredJson = { type: 'my-registered-model' };
    const defaultJson = { type: 'my-default-model' };
    const spectator = componentFactory({
      props: {
        navLocation: 'my-location',
        defaultJson: defaultJson
      },
      detectChanges: false
    });

    spectator.inject(DashboardPersistenceService).setDefaultForLocation('my-location', { content: registeredJson });
    spectator.detectChanges();

    expect(spectator.query(ApplicationAwareDashboardComponent)!.json).toBe(registeredJson);
  });

  test('applies a provided implicit filter', () => {
    const defaultJson = { type: 'my-default-model' };
    const implicitFilter = new GraphQlFieldFilter('foo', GraphQlOperatorType.Equals, 'bar');
    const spectator = componentFactory({
      props: {
        defaultJson: defaultJson,
        navLocation: 'my-location',
        filterConfig: {
          scope: 'my-scope',
          implicitFilters: [implicitFilter]
        }
      }
    });

    const mockDataSource: Partial<GraphQlFilterDataSourceModel> = {
      clearFilters: jest.fn().mockReturnThis(),
      addFilters: jest.fn()
    };

    const mockDashboard: Partial<Dashboard> = {
      getRootDataSource: jest.fn().mockReturnValue(mockDataSource),
      refresh: jest.fn()
    };
    spectator.component.onDashboardReady(mockDashboard as Dashboard);
    expect(mockDataSource.addFilters).toHaveBeenCalledWith(implicitFilter);
    expect(mockDashboard.refresh).toHaveBeenCalled();
  });

  test('applies filter updates', () => {
    const defaultJson = { type: 'my-default-model' };
    const spectator = componentFactory({
      props: {
        defaultJson: defaultJson,
        navLocation: 'my-location',
        filterConfig: {
          scope: 'my-scope'
        }
      }
    });

    const mockDataSource: Partial<GraphQlFilterDataSourceModel> = {
      clearFilters: jest.fn().mockReturnThis(),
      addFilters: jest.fn()
    };

    const mockDashboard: Partial<Dashboard> = {
      getRootDataSource: jest.fn().mockReturnValue(mockDataSource),
      refresh: jest.fn()
    };
    spectator.component.onDashboardReady(mockDashboard as Dashboard);
    const explicitFilter = {
      metadata: {
        type: AttributeMetadataType.String
      },
      field: 'foo',
      operator: UserFilterOperator.Equals,
      value: 'bar'
    };
    spectator.query(FilterBarComponent)?.filtersChange.next([explicitFilter as Filter]);
    expect(mockDataSource.addFilters).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'foo', operator: GraphQlOperatorType.Equals, value: 'bar' })
    );
  });

  test('can hide a filter bar with implicit filters', () => {
    const implicitFilter = new GraphQlFieldFilter('foo', GraphQlOperatorType.Equals, 'bar');
    const defaultJson = { type: 'my-default-model' };
    const spectator = componentFactory({
      props: {
        defaultJson: defaultJson,
        navLocation: 'my-location',
        filterConfig: {
          scope: 'my-scope',
          implicitFilters: [implicitFilter],
          hideFilterBar: true
        }
      }
    });

    const mockDataSource: Partial<GraphQlFilterDataSourceModel> = {
      clearFilters: jest.fn().mockReturnThis(),
      addFilters: jest.fn()
    };

    const mockDashboard: Partial<Dashboard> = {
      getRootDataSource: jest.fn().mockReturnValue(mockDataSource),
      refresh: jest.fn()
    };
    spectator.component.onDashboardReady(mockDashboard as Dashboard);
    expect(mockDataSource.addFilters).toHaveBeenCalledWith(implicitFilter);
    expect(mockDashboard.refresh).toHaveBeenCalled();
    expect(spectator.query(FilterBarComponent)).not.toExist();
  });
});
