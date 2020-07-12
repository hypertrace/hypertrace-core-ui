import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { TableColumnConfig, TableSortDirection } from '../../table-api';
import { TableCellAlignmentType } from '../table-cell-alignment-type';
import { TableCellRendererConstructor } from '../table-cell-renderer';
import { TableCellRendererService } from '../table-cell-renderer.service';

@Component({
  selector: 'htc-table-header-cell-renderer',
  styleUrls: ['./table-header-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="this.columnConfig"
      [ngClass]="this.classes"
      [htcTooltip]="this.columnConfig.title"
      class="table-header-cell-renderer"
    >
      {{ this.columnConfig.title }}
    </div>
  `
})
export class TableHeaderCellRendererComponent implements OnInit, OnChanges {
  @Input()
  public columnConfig?: TableColumnConfig;

  @Input()
  public index?: number;

  @Input()
  public sort?: TableSortDirection;

  public alignment?: TableCellAlignmentType;
  public rendererConstructor?: TableCellRendererConstructor;
  public classes: string[] = [];

  public constructor(private readonly tableCellRendererService: TableCellRendererService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.columnConfig || changes.sort) {
      this.classes = this.buildClasses();
    }
  }

  public ngOnInit(): void {
    if (this.columnConfig === undefined) {
      throw new Error('Table column config undefined');
    }

    if (this.index === undefined) {
      throw new Error('Table column index undefined');
    }

    this.rendererConstructor = this.tableCellRendererService.lookup(this.columnConfig.renderer);

    // Allow columnConfig to override default alignment for cell renderer
    this.alignment = this.columnConfig.alignment ?? this.rendererConstructor.alignment;
    this.classes = this.buildClasses();
  }

  private buildClasses(): string[] {
    return [this.alignment, this.sort].filter(str => str !== undefined).map(str => (str as string).toLowerCase());
  }
}
