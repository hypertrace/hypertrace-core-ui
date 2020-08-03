import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, PreferenceService } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'htc-navigation-list',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navigation-list" *htcLetAsync="this.isCollapsed$ as isCollapsed" [ngClass]="{ expanded: !isCollapsed }">
      <div class="content" *htcLetAsync="this.activeItem$ as activeItem" [htcLayoutChangeTrigger]="isCollapsed">
        <ng-container *ngFor="let item of this.navItems">
          <ng-container [ngSwitch]="item.type">
            <div *ngIf="!isCollapsed">
              <div *ngSwitchCase="'${NavItemType.Header}'" class="nav-header">
                {{ item.label }}
              </div>
            </div>

            <hr *ngSwitchCase="'${NavItemType.Divider}'" class="nav-divider" />

            <ng-container *ngSwitchCase="'${NavItemType.Link}'">
              <htc-nav-item
                [config]="item"
                [active]="item === activeItem"
                [collapsed]="isCollapsed"
                (click)="this.navigate(item)"
              >
              </htc-nav-item>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>

      <div class="resize-tab-button" (click)="this.setCollapsed(!isCollapsed)">
        <htc-icon class="resize-icon" [icon]="this.resizeIcon$ | async" size="${IconSize.Small}"></htc-icon>
      </div>

      <div class="footer" *ngIf="this.footerItems">
        <hr class="nav-divider" />

        <div *ngFor="let footerItem of footerItems" class="footer-item">
          <htc-link class="link" [url]="footerItem.url">
            <htc-icon *ngIf="isCollapsed" [icon]="footerItem.icon" size="${IconSize.Small}"></htc-icon>
            <htc-label *ngIf="!isCollapsed" [label]="footerItem.label"></htc-label>
          </htc-link>
        </div>
      </div>
    </nav>
  `
})
export class NavigationListComponent {
  private static readonly COLLAPSED_PREFERENCE: string = 'navigation-list.collapsed';
  @Input()
  public navItems: NavItemConfig[] = [];

  @Input()
  public footerItems?: FooterItemConfig[];

  public readonly activeItem$: Observable<NavItemLinkConfig | undefined>;
  public readonly isCollapsed$: Observable<boolean>;
  public readonly resizeIcon$: Observable<IconType>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly preferenceService: PreferenceService
  ) {
    this.activeItem$ = this.navigationService.navigation$.pipe(
      startWith(this.navigationService.getCurrentActivatedRoute()),
      map(() => this.findActiveItem(this.navItems))
    );
    this.isCollapsed$ = this.preferenceService.get(NavigationListComponent.COLLAPSED_PREFERENCE, false);
    this.resizeIcon$ = this.isCollapsed$.pipe(
      map(isCollapsed => (isCollapsed ? IconType.TriangleRight : IconType.TriangleLeft))
    );
  }

  public navigate(item: NavItemLinkConfig): void {
    this.navigationService.navigateWithinApp([item.matchPaths[0]]);
  }

  public setCollapsed(isCollapsed: boolean): void {
    this.preferenceService.set(NavigationListComponent.COLLAPSED_PREFERENCE, isCollapsed);
  }

  private findActiveItem(navItems: NavItemConfig[]): NavItemLinkConfig | undefined {
    return navItems
      .filter((item): item is NavItemLinkConfig => item.type === NavItemType.Link)
      .find(linkItem =>
        linkItem.matchPaths.some(matchPath =>
          this.navigationService.isRelativePathActive([matchPath], this.navigationService.rootRoute())
        )
      );
  }
}

export type NavItemConfig = NavItemLinkConfig | NavItemHeaderConfig | NavItemDividerConfig;

export interface NavItemLinkConfig {
  type: NavItemType.Link;
  icon: string;
  label: string;
  matchPaths: string[]; // For now, default path is index 0
  features?: string[];
}

export type FooterItemConfig = FooterItemLinkConfig;

export interface FooterItemLinkConfig {
  url: string;
  label: string;
  icon: string;
}

export interface NavItemHeaderConfig {
  type: NavItemType.Header;
  label: string;
}

export interface NavItemDividerConfig {
  type: NavItemType.Divider;
}

// Must be exported to be used by AOT compiler in template
export const enum NavItemType {
  Header = 'header',
  Link = 'link',
  Divider = 'divider',
  Footer = 'footer'
}
