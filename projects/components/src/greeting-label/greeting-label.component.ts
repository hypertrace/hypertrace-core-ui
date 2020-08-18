import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'htc-greeting-label',
  styleUrls: ['./greeting-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="greeting-label">{{ this.greetingMessage }}</div>`
})
export class GreetingLabelComponent implements OnChanges {
  @Input()
  public readonly label: string = '';

  public greetingMessage: string = '';

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.label) {
      this.setGreetingMessage();
    }
  }

  private setGreetingMessage(): void {
    const parts = this.label.split('{greeting}');
    this.greetingMessage = [parts[0], this.getGreeting(), parts[1]].join('');
  }

  private getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good Morning';
    }

    if (hour < 16) {
      return 'Good Afternoon';
    }

    return 'Good Evening';
  }
}
