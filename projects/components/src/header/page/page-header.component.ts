import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Breadcrumb } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { IconSize } from '../../icon/icon-size';
import { NavigableTab } from '../../tabs/navigable/navigable-tab';

@Component({
  selector: 'htc-page-header',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.breadcrumbs$ | async as breadcrumbs" class="page-header" [class.bottom-border]="!this.tabs.length">
      <div class="breadcrumb-container">
        <htc-breadcrumbs [breadcrumbs]="breadcrumbs"></htc-breadcrumbs>

        <div class="title" *ngIf="this.titlecrumb$ | async as titlecrumb">
          <htc-icon
            class="icon"
            *ngIf="titlecrumb.icon"
            [icon]="titlecrumb.icon"
            [label]="titlecrumb.label"
            size="${IconSize.Large}"
          ></htc-icon>

          <htc-label [label]="titlecrumb.label"></htc-label>
        </div>
      </div>

      <ng-content></ng-content>

      <htc-navigable-tabs class="tabs" *ngIf="this.tabs.length" [tabs]="this.tabs"></htc-navigable-tabs>
    </div>
  `
})
export class PageHeaderComponent {
  @Input()
  public tabs: NavigableTab[] = [];

  public breadcrumbs$: Observable<Breadcrumb[] | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs : undefined))
  );

  public titlecrumb$: Observable<Breadcrumb | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : {}))
  );

  public constructor(private readonly breadcrumbsService: BreadcrumbsService) {}
}
