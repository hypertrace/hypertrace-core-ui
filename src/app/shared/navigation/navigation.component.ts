import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationService, TraceRoute } from '@hypertrace/common';
import { NavItemConfig, NavItemType } from '@hypertrace/components';
import { TracingIconType } from '@hypertrace/distributed-tracing';
import { uniq } from 'lodash';

@Component({
  selector: 'htc-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <htc-navigation-list [navItems]="this.navItems"></htc-navigation-list> `
})
export class NavigationComponent {
  public readonly navItems: NavItemConfig[];

  private readonly navItemDefinitions: NavItemConfig[] = [
    {
      type: NavItemType.Link,
      label: 'Spans',
      icon: TracingIconType.OpenTracing,
      matchPaths: ['spans']
    }
  ];

  public constructor(private readonly navigationService: NavigationService) {
    this.navItems = this.navItemDefinitions.map(definition => this.decorateNavItem(definition));
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
