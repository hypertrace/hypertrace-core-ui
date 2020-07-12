import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, TimeRangeService } from '@hypertrace/common';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'htc-copy-shareable-link-to-clipboard',
  styleUrls: ['./copy-shareable-link-to-clipboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shareable-link" htcTooltip="Copy shareable url link to clipboard">
      <htc-copy-to-clipboard icon="${IconType.Share}" [text]="this.shareableUrl$ | async"></htc-copy-to-clipboard>
    </div>
  `
})
export class CopyShareableLinkToClipboardComponent implements OnInit {
  public shareableUrl$?: Observable<string>;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeRangeService: TimeRangeService
  ) {}

  public ngOnInit(): void {
    this.shareableUrl$ = merge(this.navigationService.navigation$, this.timeRangeService.getTimeRangeAndChanges()).pipe(
      map(() => this.timeRangeService.getShareableCurrentUrl())
    );
  }
}
