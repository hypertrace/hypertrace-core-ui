import { GreetingLabelComponent } from '@hypertrace/components';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';

// WIP
describe('Greeting Label component', () => {
  let spectator: Spectator<GreetingLabelComponent>;

  const createHost = createHostFactory({
    shallow: true,
    component: GreetingLabelComponent
  });

  test('should render interpolated string correctly', () => {
    jest.SpyOn(global.Date, new Date('2020-01-01T08:00:00.000Z').valueOf());
    spectator = createHost(`<htc-greeting-label [label]="templateString"></htc-greeting-label>`, {
      hostProps: {
        templateString: 'test {a} and {b}'
      }
    });

    expect(spectator.component.tokens).toEqual([
      { value: 'test ', highlight: false },
      { value: 'first value', highlight: true },
      { value: ' and ', highlight: false },
      { value: '2', highlight: true }
    ]);

    const highlightedSections = spectator.queryAll('.highlight');
    expect(highlightedSections.length).toBe(2);
    expect(highlightedSections[0]).toContainText('first value');
    expect(highlightedSections[1]).toContainText('2');
  });
});
