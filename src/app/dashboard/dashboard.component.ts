import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

import { AgGridAngular, } from 'ag-grid-angular';
import { GridOptions, IGetRowsParams, GridApi } from 'ag-grid-community';
import { faPlay, faStop, faLayerGroup, faEraser, faPeopleCarry, faEye, faSync } from '@fortawesome/free-solid-svg-icons';

import * as filesize from 'filesize';

import { SpreadsheetUIService, Torrent, AddJob, TorrentClient } from '../spreadsheet-ui.service';

import { CheckboxFilterComponent } from '../gridcomponents/checkboxfilter.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('torrentGrid') torrentGrid: AgGridAngular;
  @ViewChild('summaryGrid') summaryGrid: AgGridAngular;

  public torrentGridOptions: GridOptions;
  public torrentGridApi: GridApi;

  public summaryGridOptions: GridOptions;
  public summaryGridApi: GridApi;

  public themeClass = 'ag-theme-balham';
  public torrentHeight = 'calc(100vh - 42px)';
  public summaryHeight = '42px';

  public selectedTorrents: Array<Torrent> = [];
  public torrentStats: object;
  public autoUpdate = true;

  public iconStart = faPlay;
  public iconStop = faStop;
  public iconJobqueue = faLayerGroup;
  public iconRemove = faEraser;
  public iconMove = faPeopleCarry;
  public iconTheme = faEye;
  public iconScheduleFullUpdate = faSync;

  public torrentClients$;

  public gridThemes = [
    {displayName: "Alpine", themeClass: "ag-theme-alpine"},
    {displayName: "Alpine Dark", themeClass: "ag-theme-alpine-dark"},
    {displayName: "Balham", themeClass: "ag-theme-balham"},
    {displayName: "Balham Dark", themeClass: "ag-theme-balham-dark"},
    {displayName: "Material", themeClass: "ag-theme-material"},
  ]

  private sub: any;

  constructor(private spreadsheetui: SpreadsheetUIService, private router: Router) { }

  ngOnInit(): void {
    function sizeFormatter(params) {
      if (params.value === undefined) {
        return ''
      } else {
        return filesize(params.value || 0);
      }
    };

    function speedFormatter(params) {
      if (params.value === undefined) {
        return ''
      } else {
        return filesize(params.value || 0) + '/s';
      }
    };

    let columnDefs = [
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        filter: true,
        floatingFilter: true,
        checkboxSelection: true,
        filterParams: { filterOptions: ['contains'], }
      },
      {
        headerName: 'Size',
        field: 'size',
        sortable: true,
        width: 110,
        suppressSizeToFit: true,
        valueFormatter: sizeFormatter
      },
      {
        headerName: 'State',
        field: 'state',
        width: 80,
        suppressSizeToFit: true,
        floatingFilter: true,
        valueFormatter: (params) => params.value && params.value.charAt(0).toUpperCase() + params.value.slice(1) || '',
        filter: 'checkboxFilter',
        filterParams: {
          choices: [
            {field: 'Active', value: 'active'},
            {field: 'Stopped', value: 'stopped'},
            {field: 'Error', value: 'error'},
          ]
        },
      },
      {
        headerName: 'Progress',
        field: 'progress',
        width: 80,
        suppressSizeToFit: true,
        valueFormatter: (params) => params.value !== undefined && `${params.value}%` || ''
      },
      {
        headerName: 'Up rate',
        field: 'upload_rate',
        sortable: true,
        width: 120,
        suppressSizeToFit: true,
        valueFormatter: speedFormatter
      },
      {
        headerName: 'Dn rate',
        field: 'download_rate',
        sortable: true,
        width: 120,
        suppressSizeToFit: true,
        valueFormatter: speedFormatter
      },
      {
        headerName: 'Uploaded',
        field: 'uploaded',
        sortable: true,
        width: 110,
        suppressSizeToFit: true,
        valueFormatter: sizeFormatter
      },
      {
        headerName: 'Ratio',
        field: 'ratio',
        sortable: true,
        width: 80,
        suppressSizeToFit: true,
      },
      {
        headerName: 'Tracker',
        field: 'tracker',
        width: 100,
        suppressSizeToFit: true
      },
      {
        headerName: 'Added',
        field: 'added',
        sortable: true,
        width: 150,
        suppressSizeToFit: true,
        valueFormatter: (params) => params.value !== undefined && params.value.toISOString().split('.')[0] || ''
      },
      {
        headerName: 'Label',
        field: 'label',
        width: 100,
        hide: true,
        suppressSizeToFit: true
      },
      {
        headerName: 'Client',
        field: 'torrent_client',
        width: 130,
        suppressSizeToFit: true,
        floatingFilter: true,
        filter: 'checkboxFilter',
        filterParams: {
          choices: this.spreadsheetui.getTorrentClients(0, 100, {}).pipe(
            map(r => r["clients"].map(c => ({field: c.display_name, value: c.name})))
          )
        },
      },
    ]

    this.torrentGridOptions = <GridOptions>{
      rowModelType: 'infinite',
      columnDefs: columnDefs,
      defaultColDef: {
        resizable: true
      },
      rowSelection: 'multiple',
      onGridSizeChanged: () => {
        this.torrentGridOptions.api.sizeColumnsToFit();
      },
      frameworkComponents: {
        checkboxFilter: CheckboxFilterComponent,
      },
      alignedGrids: [],
      suppressHorizontalScroll: true,
      onFilterChanged: () => this.updateSummary(),
      onSelectionChanged: (event) => {
        this.selectedTorrents = this.torrentGridApi.getSelectedRows();
      },
    };

    this.summaryGridOptions = <GridOptions>{
      alignedGrids: [],
      defaultColDef: this.torrentGridOptions.defaultColDef,
      columnDefs: [{
        headerName: 'Name',
        field: 'name',
        valueFormatter: (params) => params.value && `Total: ${(new DecimalPipe('en-US')).transform(params.value)}` || '',
      }, ...columnDefs.slice(1)],
      rowStyle: { fontWeight: 'bold' },
    };

    this.torrentGridOptions.alignedGrids.push(this.summaryGridOptions);
    this.summaryGridOptions.alignedGrids.push(this.torrentGridOptions);

    this.sub = interval(4000).subscribe(() => this.triggerAutoupdate());
    this.torrentClients$ = this.spreadsheetui.getTorrentClients(0, 100, {}).pipe(
      map(r => r.clients),
      map(c => c.sort((a, b) => a.display_name.localeCompare(b.display_name, undefined, {sensitivity: 'base'})))
    );
    this.themeClass = this.spreadsheetui.getTheme();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  onTorrentGridReady(params: any) {
    this.torrentGridApi = params.api;
    params.api.setSortModel([{ colId: 'added', sort: 'desc' }]);
    params.api.setDatasource({
      getRows: this.getRows.bind(this)
    });
    let height = params.api.getSizesForCurrentTheme()['rowHeight'] + 14;
    this.torrentHeight = `calc(100vh - ${height}px)`;
    this.summaryHeight = `${height}px`;
  }

  onSummaryGridReady(params: any) {
    this.summaryGridApi = params.api;
    this.updateSummary();
  }

  prepareFilterParams(sortModel: any, filterModel: any) {
    let filterParams = { };

    if (sortModel) {
      filterParams['o'] = sortModel.map(f => `${f.sort == "desc" && "-" || ''}${f.colId}`).join(',');
    }

    for (let key in filterModel) {
      let value = filterModel[key];
      let filter = value.filter;
      if (value.type == 'contains') {
        key = `${key}__icontains`;
      } else if (value.type == 'in') {
        key = `${key}__in`;
        filter = filter.join(',');
      }
      filterParams[key] = filter;
    }
    return filterParams;
  }

  getRows(params: IGetRowsParams) {
    let filterParams = this.prepareFilterParams(params.sortModel, params.filterModel);
    this.spreadsheetui.getTorrents(params.startRow, params.endRow - params.startRow, filterParams)
      .subscribe(r => params.successCallback(r.torrents, r.count));
  }

  updateSummary() {
    let filterParams = {}
    if (this.torrentGridApi) {
      filterParams = this.prepareFilterParams([], this.torrentGridApi.getFilterModel());
    }
    this.spreadsheetui.getTorrentAggregated(filterParams).subscribe((r) => this.summaryGridApi.setRowData([r]));
  }

  triggerAutoupdate() {
    if (!this.autoUpdate || document.hidden) {
      return;
    }

    if (this.torrentGridApi) {
      if (this.torrentGridApi.getInfiniteRowCount() == 0) {
        this.torrentGridApi.purgeInfiniteCache();
      } else {
        this.torrentGridApi.refreshInfiniteCache();
      }
      this.updateSummary();
    }
  }

  toggleAutoupdate() {
    this.autoUpdate = !this.autoUpdate;
  }

  scheduleFullUpdate() {
    this.spreadsheetui.scheduleFullUpdate().subscribe();
  }

  startTorrents(torrents: Array<Torrent>) {
    let jobs = torrents.map(t => new AddJob('start', t.id));
    this.spreadsheetui.submitJobs(jobs).subscribe();
  }

  stopTorrents(torrents: Array<Torrent>) {
    let jobs = torrents.map(t => new AddJob('stop', t.id));
    this.spreadsheetui.submitJobs(jobs).subscribe();
  }

  removeTorrents(torrents: Array<Torrent>) {
    let jobs = torrents.map(t => new AddJob('remove', t.id));
    this.spreadsheetui.submitJobs(jobs).subscribe();
  }

  moveTorrents(torrents: Array<Torrent>, torrentClient: TorrentClient) {
    let jobs = torrents.map(t => new AddJob('move', t.id, torrentClient.id));
    this.spreadsheetui.submitJobs(jobs).subscribe();
  }

  openJobqueue() {
    this.router.navigate(['jobqueue']);
  }

  setTheme(theme: string) {
    this.spreadsheetui.setTheme(theme);
    location.reload();
  }
}
