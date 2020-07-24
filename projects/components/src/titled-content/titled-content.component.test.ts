import { LabelComponent } from '@hypertrace/components';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { TitledHeaderControlDirective } from './header-controls/titled-header-control.directive';
import { TitledContentComponent } from './titled-content.component';

describe('Titled content component', () => {
  let spectator: Spectator<TitledContentComponent>;

  const createHost = createHostFactory({
    shallow: true,
    declarations: [MockComponent(LabelComponent), TitledHeaderControlDirective],
    component: TitledContentComponent
  });

  test('should render content with no title provided', () => {
    spectator = createHost(
      `
    <htc-titled-content>
      My content
    </htc-titled-content>
    `
    );

    expect(spectator.query('.content')).toHaveText('My content');
    expect(spectator.query('.title')).not.toExist();
  });

  test('should render content and title i', () => {
    spectator = createHost(
      `
      <htc-titled-content>
        My content
      </htc-titled-content>
      `,
      {
        props: {
          title: 'Example title'
        }
      }
    );

    expect(spectator.query(LabelComponent)!.label).toEqual('Example title');
    expect(spectator.query('.content')).toHaveText('My content');
  });

  test('should render header control', () => {
    spectator = createHost(
      `
      <htc-titled-content>
        My content
        <div *htcTitledHeaderControl class="projected-control">Header Control</div>
      </htc-titled-content>
      `
    );
    expect(spectator.query('.controls')).toExist();
    expect(spectator.query('.projected-control')).toHaveText('Header Control');
  });
});
