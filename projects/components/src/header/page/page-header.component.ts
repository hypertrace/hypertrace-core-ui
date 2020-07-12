import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Breadcrumb } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { IconSize } from '../../icon/icon-size';

@Component({
  selector: 'htc-page-header',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header-container" *ngIf="this.breadcrumbs$ | async as breadcrumbs">
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
    </div>
  `
})
export class PageHeaderComponent {
  public breadcrumbs$: Observable<Breadcrumb[] | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs : undefined))
  );

  public titlecrumb$: Observable<Breadcrumb | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : {}))
  );

  public constructor(private readonly breadcrumbsService: BreadcrumbsService) {}
}
