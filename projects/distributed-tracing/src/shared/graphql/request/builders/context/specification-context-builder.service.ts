import { Injectable } from '@angular/core';
import { IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { SpecificationResolutionContext } from '../../../model/schema/specifier/specification';

@Injectable({ providedIn: 'root' })
export class SpecificationContextBuilder {
  public constructor(private readonly intervalDurationService: IntervalDurationService) {}

  public buildContext(): SpecificationResolutionContext {
    let resolvedDuration: TimeDuration | undefined;

    return {
      getAutoInterval: () => {
        if (!resolvedDuration) {
          // Save the value so later evaluations of the same context always return the same
          resolvedDuration = this.intervalDurationService.getAutoDuration();
        }

        return resolvedDuration;
      }
    };
  }
}
