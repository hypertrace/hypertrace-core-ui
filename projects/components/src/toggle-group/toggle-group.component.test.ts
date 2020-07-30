import { fakeAsync } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { ToggleGroupComponent, ToggleGroupModule } from '@hypertrace/components';
import { byText, createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { Toggle } from './filter-tab';

describe('Filter Tabs Component', () => {
  let spectator: Spectator<ToggleGroupComponent>;

  const createHost = createHostFactory({
    component: ToggleGroupComponent,
    declareComponent: false,
    imports: [ToggleGroupModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn()
      })
    ]
  });

  test('should toggle filter tabs', fakeAsync(() => {
    const tabs: Toggle[] = [
      {
        label: 'First',
        value: 'first-value'
      },
      {
        label: 'Second',
        value: 'second-value'
      }
    ];
    const activeTab: Toggle = tabs[1];
    const activeTabChangeSpy = jest.fn();

    spectator = createHost(
      `
      <htc-filter-toggle [tabs]="this.tabs" [activeTab]="this.activeTab" (activeTabChange)="this.activeTabChange($event)">
      </htc-filter-toggle>
    `,
      {
        hostProps: {
          tabs: tabs,
          activeTab: activeTab,
          activeTabChange: activeTabChangeSpy
        }
      }
    );

    spectator.tick();
    expect(activeTabChangeSpy).toHaveBeenCalledWith(tabs[1]);

    spectator.click(spectator.query(byText('First'))!);
    spectator.tick();
    expect(activeTabChangeSpy).toHaveBeenCalledWith(tabs[0]);
  }));
});
