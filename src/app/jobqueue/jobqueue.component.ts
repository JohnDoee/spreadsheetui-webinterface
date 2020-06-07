import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';

import { GridOptions, IGetRowsParams, GridApi } from 'ag-grid-community';
import { faTrash, faPlay } from '@fortawesome/free-solid-svg-icons';
import { SpreadsheetUIService } from '../spreadsheet-ui.service';

@Component({
  selector: 'app-jobqueue',
  templateUrl: './jobqueue.component.html',
  styleUrls: ['./jobqueue.component.scss']
})
export class JobqueueComponent implements OnInit, OnDestroy {
  public jobqueueGridOptions: GridOptions;
  public jobqueueGridApi: GridApi;

  public themeClass = 'ag-theme-balham';

  public iconExecute = faPlay;
  public iconRemove = faTrash;

  private sub: any;

  constructor(private router: Router, private spreadsheetui: SpreadsheetUIService) { }

  ngOnInit(): void {
    this.jobqueueGridOptions = <GridOptions>{
      rowModelType: 'infinite',
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          width: 80,
          suppressSizeToFit: true,
        },
        {
          headerName: 'Action',
          field: 'action',
          width: 110,
          suppressSizeToFit: true,
          valueFormatter: (params) => params.value && params.value.charAt(0).toUpperCase() + params.value.slice(1) || '',
        },
        {
          headerName: 'Name',
          field: 'torrent',
        },
        {
          headerName: 'Source client',
          field: 'sourceClient',
          width: 130,
          suppressSizeToFit: true,
        },
        {
          headerName: 'Target client',
          field: 'targetClient',
          width: 130,
          suppressSizeToFit: true,
        },
        {
          headerName: 'Queued for execution',
          field: 'canExecute',
          width: 150,
          suppressSizeToFit: true,
          valueFormatter: (params) => params.value && 'Yes' || 'No'
        },
      ],
      defaultColDef: {
        resizable: true
      },
      rowSelection: 'multiple',
      onGridSizeChanged: () => {
        this.jobqueueGridOptions.api.sizeColumnsToFit();
      },
      alignedGrids: [],
      suppressHorizontalScroll: true,
    };

    this.sub = interval(4000).subscribe(() => this.triggerAutoupdate());
    this.themeClass = this.spreadsheetui.getTheme();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  triggerAutoupdate() {
    if (document.hidden) {
      return;
    }
    if (this.jobqueueGridApi) {
      if (this.jobqueueGridApi.getInfiniteRowCount() == 0) {
        this.jobqueueGridApi.purgeInfiniteCache();
      } else {
        this.jobqueueGridApi.refreshInfiniteCache();
      }
    }
  }

  onJobqueueGridReady(params: any) {
    this.jobqueueGridApi = params.api;
    params.api.setDatasource({
      getRows: this.getRows.bind(this)
    });
  }

  getRows(params: IGetRowsParams) {
    this.spreadsheetui.getJobs(params.startRow, params.endRow - params.startRow, {})
      .subscribe(r => params.successCallback(r.jobs, r.count));
  }

  executeAllJobs() {
    this.spreadsheetui.executeAllJobs().subscribe(() => this.triggerAutoupdate());
  }

  removeAllJobs() {
    this.spreadsheetui.wipeAllJobs().subscribe(() => this.triggerAutoupdate());
  }

  openDashboard() {
    this.router.navigate(['dashboard']);
  }

}
