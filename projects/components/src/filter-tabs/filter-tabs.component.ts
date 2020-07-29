import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { FilterTab } from './filter-tab';
import { FilterTabComponent } from './filter-tab.component';

@Component({
  selector: 'htc-filter-tabs',
  styleUrls: ['./filter-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-tabs" *ngIf="this.activeTab">
      <div
        class="active"
        *ngIf="this.activeElementPosition"
        [style.left.px]="this.activeElementPosition.left"
        [style.width.px]="this.activeElementPosition.width"
      ></div>
      <div class="container" *ngFor="let tab of this.tabs; let index = index">
        <div class="divider" *ngIf="index !== 0" [class.adjacent-active]="this.isAdjacentActiveTab(index)"></div>
        <htc-filter-tab class="tab" [label]="tab.label" (click)="this.setActiveTab(tab)"></htc-filter-tab>
      </div>
    </div>
  `
})
export class FilterTabsComponent implements AfterViewInit, OnChanges {
  @Input()
  public readonly tabs?: FilterTab[] = [];

  @Input()
  public activeTab?: FilterTab;

  @Output()
  public readonly activeTabChange: EventEmitter<FilterTab> = new EventEmitter();

  @ViewChildren(FilterTabComponent, { read: FilterTabComponent })
  private readonly tabElements!: QueryList<FilterTabComponent>;

  private activeTabIndex?: number;
  public activeElementPosition?: { left: number; width: number };

  public constructor(private readonly changeDetector: ChangeDetectorRef) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.tabs) {
      this.setActiveTab();
    }
  }

  public ngAfterViewInit(): void {
    this.setActiveTab();
  }

  public setActiveTab(tab?: FilterTab): void {
    this.activeTab = tab || (this.tabs && this.tabs[0]);
    this.activeTabIndex = this.tabs?.indexOf(this.activeTab!);
    this.activeElementPosition = this.getElementPosition(this.activeTab!, this.activeTabIndex);
    this.activeTabChange.emit(this.activeTab);
    this.changeDetector.markForCheck();
  }

  public isAdjacentActiveTab(index: number): boolean {
    return (
      this.activeTabIndex !== undefined && (index - this.activeTabIndex === 1 || index - this.activeTabIndex === 0)
    );
  }

  private getElementPosition(tab: FilterTab, index: number = 0): { left: number; width: number } {
    const element = this.getTabElement(tab)?.nativeElement;
    if (element === undefined) {
      return { left: 0, width: 0 };
    }

    return {
      left: +element.offsetLeft + 2, // Add 2 for the margin on the parent
      width: element.offsetWidth - (index + 1) // Subtract approximate cumulative margin (not exact due to flexbox)
    };
  }

  private getTabElement(tab?: FilterTab): ElementRef | undefined {
    return tab && this.tabElements.find(tabElement => tabElement.label === tab.label)?.elementRef;
  }
}
