import { IntervalDurationService, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { SpecificationContextBuilder } from './specification-context-builder.service';

describe('Specification context builder service', () => {
  const serviceBuilder = createServiceFactory({
    service: SpecificationContextBuilder
  });
  test('builds context', () => {
    const testInterval = new TimeDuration(5, TimeUnit.Minute);
    const testSecondInterval = new TimeDuration(10, TimeUnit.Minute);
    const spectator = serviceBuilder({
      providers: [
        mockProvider(IntervalDurationService, {
          getAutoDuration: jest.fn().mockReturnValueOnce(testInterval).mockReturnValueOnce(testSecondInterval)
        })
      ]
    });

    const context = spectator.service.buildContext();
    expect(context.getAutoInterval()).toEqual(testInterval);
    expect(context.getAutoInterval()).not.toEqual(testSecondInterval);
  });
});
