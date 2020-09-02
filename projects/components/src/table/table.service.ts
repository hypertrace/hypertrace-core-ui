import { Injectable, Injector } from '@angular/core';
import { FilterAttribute } from '../filter-bar/filter-attribute';
import { FilterType } from '../filter-bar/filter-type';
import { TableCellParserLookupService } from './cells/table-cell-parser-lookup.service';
import { TableCellRendererLookupService } from './cells/table-cell-renderer-lookup.service';
import { CoreTableCellRendererType } from './cells/types/core-table-cell-renderer-type';
import { TableCdkDataSource } from './data/table-cdk-data-source';
import { TableColumnConfig, TableColumnConfigExtended } from './table-api';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private static readonly STATE_ATTRIBUTE: FilterAttribute = {
    name: '$$state',
    displayName: 'Row State',
    type: '$$state' as FilterType
  };

  public constructor(
    private readonly injector: Injector,
    private readonly tableCellRendererLookupService: TableCellRendererLookupService,
    private readonly tableCellParserLookupService: TableCellParserLookupService
  ) {}

  public buildExtendedColumnConfigs(
    columnConfigs: TableColumnConfig[],
    dataSource: TableCdkDataSource,
    attributes: FilterAttribute[] = []
  ): TableColumnConfigExtended[] {
    return columnConfigs.map(columnConfig => {
      const attribute = this.isStateColumnConfig(columnConfig)
        ? TableService.STATE_ATTRIBUTE
        : attributes.find(attr => attr.name === columnConfig.name);

      const rendererConstructor = this.tableCellRendererLookupService.lookup(
        columnConfig.display !== undefined ? columnConfig.display : CoreTableCellRendererType.Text
      );

      const parserConstructor = this.tableCellParserLookupService.lookup(rendererConstructor.parser);

      return {
        ...columnConfig,
        attribute: attribute,
        renderer: rendererConstructor,
        parser: new parserConstructor(this.injector),
        filterValues: dataSource.getFilterValues(columnConfig.field)
      };
    });
  }

  public updateFilterValues(columnConfigs: TableColumnConfigExtended[], dataSource: TableCdkDataSource): void {
    columnConfigs.forEach(columnConfig => (columnConfig.filterValues = dataSource.getFilterValues(columnConfig.field)));
  }

  private isStateColumnConfig(columnConfig: TableColumnConfig): boolean {
    return columnConfig.field === '$$state';
  }
}
