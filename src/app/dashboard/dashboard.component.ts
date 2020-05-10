import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

import { AgGridAngular, } from 'ag-grid-angular';
import { GridOptions, IGetRowsParams } from 'ag-grid-community';
import { ContextMenuComponent } from 'ngx-contextmenu';

import * as filesize from 'filesize';

import { SpreadsheetUIService } from '../spreadsheet-ui.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('agGrid') agGrid: AgGridAngular;

  public gridOptions: any;
  public gridApi: any;

  public torrentStats: object;
  public autoUpdate = true;

  private sub: any;

  constructor(private spreadsheetui: SpreadsheetUIService) {
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

    this.gridOptions = <GridOptions>{
      rowModelType: 'infinite',
      columnDefs: [
        {
          headerName: 'Id',
          field: 'id',
          width: 60,
          resizable: false,
          suppressSizeToFit: true,
          sortable: true
        },
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
          width: 90,
          suppressSizeToFit: true,
          valueFormatter: sizeFormatter
        },
        {
          headerName: 'State',
          field: 'state',
          width: 80,
          suppressSizeToFit: true
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
          width: 100,
          suppressSizeToFit: true,
          valueFormatter: speedFormatter
        },
        {
          headerName: 'Dn rate',
          field: 'download_rate',
          sortable: true,
          width: 100,
          suppressSizeToFit: true,
          valueFormatter: speedFormatter
        },
        {
          headerName: 'Uploaded',
          field: 'uploaded',
          sortable: true,
          width: 100,
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
          suppressSizeToFit: true
        },
      ],
      defaultColDef: {
        resizable: true
      },
      rowSelection: 'multiple',
      onGridSizeChanged: () => {
        this.gridOptions.api.sizeColumnsToFit();
    }
    }
  }

  ngOnInit(): void {
    this.updateStats();
    this.sub = interval(4000).subscribe(() => this.triggerAutoupdate());
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    params.api.setSortModel([{ colId: 'added', sort: 'desc' }]);
    params.api.setDatasource({
      getRows: this.getRows.bind(this)
    });

  }

  getRows(params: IGetRowsParams) {
    let filterParams = {
      o: params.sortModel.map(f => `${f.sort == "desc" && "-" || ''}${f.colId}`).join(','),
    };

    for (let key in params.filterModel) {
      let value = params.filterModel[key];
      if (value.type == 'contains') {
        key = `${key}__icontains`;
      }
      filterParams[key] = value.filter;
    }

    this.spreadsheetui.getTorrents(params.startRow, params.endRow - params.startRow, filterParams)
      .subscribe(r => params.successCallback(r.torrents, r.count));
  }

  updateStats() {
    this.spreadsheetui.getTorrentStats().pipe(
      map(r => {
        let s = {};
        s['total_torrents'] = r['total_torrents'];
        s['total_size'] = filesize(r['total_size']);
        s['total_uploaded'] = filesize(r['total_uploaded']);
        s['total_upload_rate'] = `${filesize(r['total_upload_rate'])}/s`;
        s['total_download_rate'] = `${filesize(r['total_download_rate'])}/s`;
        return s;
      })
    ).subscribe(r => this.torrentStats = r);
  }

  triggerAutoupdate() {
    if (!this.autoUpdate) {
      return;
    }

    this.gridApi.refreshInfiniteCache();
    this.updateStats();
  }

  toggleAutoupdate() {
    this.autoUpdate = !this.autoUpdate;
  }

}
