import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import { CONTENT_HOLDER_TEMPLATE, ContentHolder } from '../../content/content-holder';

@Component({
  selector: 'htc-navigable-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CONTENT_HOLDER_TEMPLATE
})
export class NavigableTabComponent extends ContentHolder {
  public constructor(private readonly navService: NavigationService, private readonly activatedRoute: ActivatedRoute) {
    super();
  }
  @Input()
  public path!: string;

  public get features(): string[] {
    const route = this.navService.getRouteConfig([this.path], this.activatedRoute);

    return (route && route.data && route.data.features) || [];
  }
}
