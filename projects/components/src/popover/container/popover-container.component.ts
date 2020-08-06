import { ChangeDetectionStrategy, Component, Inject, InjectionToken, Injector, TemplateRef, Type } from '@angular/core';
import { POPOVER_DATA } from '../popover';

export const POPOVER_CONTAINER_DATA = new InjectionToken<PopoverContainerData>('POPOVER_CONTAINER_DATA');

@Component({
  selector: 'htc-popover-container',
  styleUrls: ['./popover-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="this.isComponentRenderer; else templateRenderer">
      <ng-container
        *ngComponentOutlet="this.containerData.popoverRenderer; injector: this.containerData.popoverInjector"
      >
      </ng-container>
    </ng-container>
    <ng-template #templateRenderer>
      <ng-container *ngTemplateOutlet="this.containerData.popoverRenderer; context: this.templateContext">
      </ng-container>
    </ng-template>
  `
})
export class PopoverContainerComponent {
  public readonly isComponentRenderer: boolean;
  public readonly templateContext: unknown;
  public constructor(
    @Inject(POPOVER_CONTAINER_DATA)
    public readonly containerData: PopoverContainerData
  ) {
    this.isComponentRenderer = !(containerData.popoverRenderer instanceof TemplateRef);
    // tslint:disable-next-line: no-null-keyword Required so angular doesn't default to throw
    this.templateContext = this.containerData.popoverInjector.get(POPOVER_DATA, null);
  }
}

export interface PopoverContainerData {
  popoverRenderer: Type<unknown> | TemplateRef<unknown>;
  popoverInjector: Injector;
}
