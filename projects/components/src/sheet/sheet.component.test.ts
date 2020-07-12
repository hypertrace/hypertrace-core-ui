import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavigationService } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { ReplaySubject } from 'rxjs';
import { ButtonModule } from '../button/button.module';
import { SheetComponent, SheetSize } from './sheet.component';

describe('Sheet component', () => {
  let spectator: Spectator<SheetComponent>;

  const createHost = createHostFactory({
    component: SheetComponent,
    imports: [ButtonModule, HttpClientTestingModule],
    providers: [mockProvider(NavigationService)]
  });

  test('should display the title', () => {
    spectator = createHost(`
    <htc-sheet sheetTitle="test title">
    </htc-sheet>
    `);

    expect(spectator.query('.header')).toHaveText('test title');
  });

  test('uses the requested size', () => {
    spectator = createHost(`
    <htc-sheet size="${SheetSize.Large}">
    </htc-sheet>
    `);

    expect(spectator.query('.htc-sheet')).toHaveClass('sheet-size-large');
  });

  test('supports toggling visibility by input', () => {
    spectator = createHost(`
    <htc-sheet [visible]="false">
    </htc-sheet>
    `);
    expect(spectator.query('.htc-sheet')).toBeNull();
    spectator.setInput({
      visible: true
    });
    expect(spectator.query('.htc-sheet')).not.toBeNull();
    spectator.setInput({
      visible: false
    });
    expect(spectator.query('.htc-sheet')).toBeNull();
  });

  test('supports toggling visibility by component API', () => {
    spectator = createHost(`
    <htc-sheet [visible]="false">
    </htc-sheet>
    `);
    spectator.component.open();
    spectator.detectComponentChanges();
    expect(spectator.query('.htc-sheet')).not.toBeNull();
    spectator.component.close();
    spectator.detectComponentChanges();
    expect(spectator.query('.htc-sheet')).toBeNull();
  });

  test('closes on close button click', () => {
    spectator = createHost(`
    <htc-sheet>
    </htc-sheet>
    `);
    spectator.click('.close-button');
    expect(spectator.query('.htc-sheet')).toBeNull();
  });

  test('outputs on close via api or click, but not input change', () => {
    spectator = createHost(`
    <htc-sheet>
    </htc-sheet>
    `);
    const visibility$ = new ReplaySubject<boolean>();
    spectator.output<boolean>('visibleChange').subscribe(visibility$);
    runFakeRxjs(({ expectObservable }) => {
      spectator.click('.close-button');
      spectator.component.open();
      spectator.detectComponentChanges();
      spectator.setInput({
        visible: false
      });
      // Actually closed, but last notification sent for open
      expect(spectator.query('.htc-sheet')).toBeNull();
      expectObservable(visibility$).toBe('(xy)', { x: false, y: true });
    });
  });

  test('does not output more than once if opened or closed multiple consecutive times', () => {
    spectator = createHost(`
    <htc-sheet>
    </htc-sheet>
    `);
    const visibility$ = new ReplaySubject<boolean>();
    spectator.output<boolean>('visibleChange').subscribe(visibility$);
    runFakeRxjs(({ expectObservable }) => {
      spectator.component.close();
      spectator.detectComponentChanges();
      spectator.component.close();
      spectator.detectComponentChanges();
      spectator.component.open();
      spectator.detectComponentChanges();
      spectator.component.open();
      spectator.detectComponentChanges();
      spectator.component.close();
      spectator.detectComponentChanges();
      expect(spectator.query('.htc-sheet')).toBeNull();
      expectObservable(visibility$).toBe('(xyx)', { x: false, y: true });
    });
  });

  test('displays contents provided', () => {
    spectator = createHost(`
      <htc-sheet>
        My contents
      </htc-sheet>
      `);

    expect(spectator.query('.content')).toHaveText('My contents');
  });
});
