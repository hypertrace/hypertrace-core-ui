import { fakeAsync } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { ToggleGroupComponent, ToggleGroupModule, ToggleItem } from '@hypertrace/components';
import { byText, createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';

describe('Toggle Group Component', () => {
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

  test('should toggle items', fakeAsync(() => {
    const items: ToggleItem[] = [
      {
        label: 'First',
        value: 'first-value'
      },
      {
        label: 'Second',
        value: 'second-value'
      }
    ];
    const activeItem: ToggleItem = items[1];
    const activeItemChangeSpy = jest.fn();

    spectator = createHost(
      `
      <htc-toggle-group [items]="this.items" [activeItem]="this.activeItem" (activeItemChange)="this.activeItemChange($event)">
      </htc-toggle-group>
    `,
      {
        hostProps: {
          items: items,
          activeItem: activeItem,
          activeItemChange: activeItemChangeSpy
        }
      }
    );

    spectator.tick();
    expect(activeItemChangeSpy).toHaveBeenCalledWith(items[1]);

    spectator.click(spectator.query(byText('First'))!);
    spectator.tick();
    expect(activeItemChangeSpy).toHaveBeenCalledWith(items[0]);
  }));
});
