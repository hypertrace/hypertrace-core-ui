import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { MultiSelectComponent, MultiSelectModule, SelectJustify, SelectModule } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';

describe('Multi Select Component', () => {
  const hostFactory = createHostFactory<MultiSelectComponent<string>>({
    component: MultiSelectComponent,
    imports: [MultiSelectModule, SelectModule, HttpClientTestingModule],
    declareComponent: false,
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn()
      })
    ]
  });

  let spectator: SpectatorHost<MultiSelectComponent<string>>;

  const selectionOptions = [
    { label: 'first', value: 'first-value' },
    { label: 'second', value: 'second-value' },
    { label: 'third', value: 'third-value' }
  ];

  test('should display initial selections', fakeAsync(() => {
    spectator = hostFactory(
      `
    <htc-multi-select [selected]="selected">
      <htc-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value]
        }
      }
    );
    spectator.tick();

    spectator.click('.trigger-content');
    expect(spectator.element).toHaveText(selectionOptions[1].label);

    spectator.setHostInput({
      selected: [selectionOptions[1].value, selectionOptions[2].value]
    });

    spectator.tick();
    const selectedElements = spectator.queryAll('input:checked', { root: true });
    expect(selectedElements.length).toBe(2);
  }));

  test('should display provided options when clicked', fakeAsync(() => {
    spectator = hostFactory(
      `
    <htc-multi-select [selected]="selected">
      <htc-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value, selectionOptions[2].value]
        }
      }
    );
    spectator.tick();

    spectator.click('.trigger-content');
    const optionElements = spectator.queryAll('.multi-select-option', { root: true });
    expect(spectator.query('.multi-select-content', { root: true })).toExist();
    expect(optionElements.length).toBe(3);

    const selectedElements = spectator.queryAll('input:checked', { root: true });
    expect(selectedElements.length).toBe(2);

    optionElements.forEach((element, index) => expect(element).toHaveText(selectionOptions[index].label));
  }));

  test('should notify and update selection when selection is changed', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <htc-multi-select [selected]="selected" (selectedChange)="onChange($event)">
      <htc-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');

    const optionElements = spectator.queryAll('.multi-select-option', { root: true });
    spectator.click(optionElements[2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([selectionOptions[1].value, selectionOptions[2].value]);
    expect(spectator.element).toHaveText('second and 1 more');
    flush();
  }));

  test('should set correct label alignment', fakeAsync(() => {
    spectator = hostFactory(
      `
    <htc-multi-select [selected]="selected" [showBorder]="showBorder">
      <htc-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          showBorder: true
        }
      }
    );
    spectator.tick();

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-left'));

    spectator.setInput({
      showBorder: false
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-right'));

    spectator.setInput({
      justify: SelectJustify.Left
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-left'));

    spectator.setInput({
      justify: SelectJustify.Right
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-right'));

    spectator.setInput({
      justify: SelectJustify.Center
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-center'));
  }));
});
