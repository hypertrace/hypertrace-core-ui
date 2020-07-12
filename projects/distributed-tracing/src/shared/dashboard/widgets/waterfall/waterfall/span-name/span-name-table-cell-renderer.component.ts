import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableCellAlignmentType, TableCellRenderer, TableCellRendererComponent } from '@hypertrace/components';

@Component({
  selector: 'htc-span-name-table-cell-renderer',
  styleUrls: ['./span-name-table-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-title" [htcTooltip]="this.value.tooltip" [ngClass]="{ clickable: this.clickable }">
      <div class="color-bar" [style.backgroundColor]="this.value.color" *ngIf="this.value.color"></div>
      <div class="service-name">
        <span class="text">{{ this.value.serviceName }}</span>
      </div>
      <div class="protocol-name" *ngIf="this.value.protocolName">
        <span class="text">{{ this.value.protocolName }}</span>
      </div>
      <div class="span-name">
        <span class="text">{{ this.value.name }}</span>
      </div>
    </div>
  `
})
@TableCellRenderer({
  type: SpanNameTableCellRendererComponent.SPAN_NAME,
  alignment: TableCellAlignmentType.Left
})
export class SpanNameTableCellRendererComponent extends TableCellRendererComponent<SpanNameCellRendererData, Parsed> {
  public static readonly SPAN_NAME: string = 'span-name';

  protected parseValue(raw: SpanNameCellRendererData): Parsed {
    return {
      ...raw,
      tooltip: `${raw.serviceName} ${raw.protocolName} ${raw.name}`
    };
  }
}

export interface SpanNameCellRendererData {
  serviceName: string;
  protocolName: string;
  name: string;
  color?: string;
}

interface Parsed extends SpanNameCellRendererData {
  tooltip: string;
}
