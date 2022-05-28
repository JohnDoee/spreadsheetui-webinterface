import { Component, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { isObservable, of } from "rxjs";
import {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
  IFilterParams,
  RowNode,
} from 'ag-grid-community';
import { IFilterAngularComp } from 'ag-grid-angular';
import { GridOptions, IGetRowsParams } from "ag-grid-community";

@Component({
  selector: 'app-checkboxfilter',
  template: `
  <div class="ag-menu-header ag-tabs-header" style="height: 0px; visibility: hidden;">
    <!--- Spacer item --->
  </div>
  <div style="width: 208px;">
  <div class="ag-filter-body-wrapper ag-simple-filter-body-wrapper">
    <div>
    <ag-grid-angular
      style="width: 100%; height: 350px;"
      class="{{ themeClass }}"
      [gridOptions]="gridOptions"
      [columnDefs]="columnDefs">
    </ag-grid-angular>
    </div>
  </div>
  <div class="ag-filter-apply-panel">
    <button (click)="clearSelection()" type="button" class="ag-standard-button ag-filter-apply-panel-button">Reset filter</button>
  </div>
</div>`,
})
export class CheckboxFilterComponent implements IFilterAngularComp, OnDestroy {
  private params: IFilterParams;
  private valueGetter: any;
  public gridApi: any;
  public themeClass = 'ag-theme-balham';
  public modelData: string[] = null;
  private sub: any;
  private obv: any;

  public columnDefs = [
    { headerName: 'Field', field: 'field', checkboxSelection: true, filter: true, sort: 'asc', comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) },
  ];
  public gridOptions = <GridOptions>{
    defaultColDef: {
      resizable: true,
      floatingFilter: true,
    },
    onFirstDataRendered: (params) => params.api.sizeColumnsToFit(),
    onGridReady: (params) => {
      this.gridApi = params.api;
      this.sub = this.obv.subscribe(r => params.api.setRowData(r)); // TODO: select with checkbox
    },
    headerHeight: 0,
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
    onSelectionChanged: () => {
      let rows = this.gridApi.getSelectedRows().map(r => r['value']);
      this.modelData = rows.length > 0 && rows || null;
      this.params.filterChangedCallback();
    }
  }

  agInit(params: IFilterParams): void {
    this.themeClass = params.api['focusService']['eGridDiv']['className'];
    this.params = params;
    this.valueGetter = params.valueGetter;
    let choices = params['choices'];
    this.obv = isObservable(choices) && choices || of(choices);
  }

  isFilterActive(): boolean {
    return !!this.modelData;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    return true; // TODO
  }

  getModel(): any {
    if (!this.modelData) {
      return null;
    }
    return {type: 'in', filter: this.modelData};
  }

  setModel(model: string[] | null): void {
    this.modelData = model;
    // TODO: refresh grid
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  clearSelection() {
    this.gridApi.deselectAll();
  }

  getModelAsString(model: any) {
    if (!model) {
      return null
    }
    return model['filter'].join(', ');
  }
}
