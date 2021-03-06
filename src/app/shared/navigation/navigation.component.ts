import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationService, PreferenceService, TraceRoute } from '@hypertrace/common';
import { NavItemConfig, NavItemType } from '@hypertrace/components';
import { TracingIconType } from '@hypertrace/distributed-tracing';
import { uniq } from 'lodash-es';
import { Observable } from 'rxjs';

@Component({
  selector: 'htc-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./navigation.component.scss'],
  template: `
    <div class="navigation">
      <htc-navigation-list
        [navItems]="this.navItems"
        *htcLetAsync="this.isCollapsed$ as isCollapsed"
        [collapsed]="isCollapsed"
        (collapsedChange)="this.onViewToggle($event)"
      ></htc-navigation-list>
    </div>
  `
})
export class NavigationComponent {
  private static readonly COLLAPSED_PREFERENCE: string = 'app-navigation.collapsed';
  public readonly navItems: NavItemConfig[];
  public readonly isCollapsed$: Observable<boolean>;

  private readonly navItemDefinitions: NavItemConfig[] = [
    {
      type: NavItemType.Link,
      label: 'Spans',
      icon: TracingIconType.OpenTracing,
      matchPaths: ['spans']
    }
  ];

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly preferenceService: PreferenceService
  ) {
    this.navItems = this.navItemDefinitions.map(definition => this.decorateNavItem(definition));
    this.isCollapsed$ = this.preferenceService.get(NavigationComponent.COLLAPSED_PREFERENCE, false);
  }

  public onViewToggle(collapsed: boolean): void {
    this.preferenceService.set(NavigationComponent.COLLAPSED_PREFERENCE, collapsed);
  }

  private decorateNavItem(navItem: NavItemConfig): NavItemConfig {
    if (navItem.type !== NavItemType.Link) {
      return { ...navItem };
    }
    const features = navItem.matchPaths
      .map(path => this.navigationService.getRouteConfig([path], this.navigationService.rootRoute()))
      .filter((maybeRoute): maybeRoute is TraceRoute => maybeRoute !== undefined)
      .flatMap(route => this.getFeaturesForRoute(route))
      .concat(navItem.features || []);

    return {
      ...navItem,
      features: uniq(features)
    };
  }

  private getFeaturesForRoute(route: TraceRoute): string[] {
    return (route.data && route.data.features) || [];
  }
}
