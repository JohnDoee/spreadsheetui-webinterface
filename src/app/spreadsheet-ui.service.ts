import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class Torrent {
  constructor(
    public id: number,
    public name: string,
    public infohash: string,
    public progress: number,
    public size: number,
    public state: number,
    public uploaded: number,
    public ratio: number,
    public upload_rate: number,
    public download_rate: number,
    public tracker: string,
    public torrent_client: string,
    public label: string,
    public added: Date,
  ) { }

  static fromData(data: any): Torrent {
    return new Torrent(
      data['id'],
      data['name'],
      data['infohash'],
      parseFloat(data['progress']),
      data['size'],
      data['state'],
      data['uploaded'],
      parseFloat(data['ratio']),
      data['upload_rate'],
      data['download_rate'],
      data['tracker'],
      data['torrent_client'],
      data['label'],
      new Date(data['added']),
    )
  }
}

export class TorrentClient {
  constructor(
    public id: number,
    public name: string,
    public display_name: string,
  ) { }

  static fromData(data: any): TorrentClient {
    return new TorrentClient(
      data['id'],
      data['name'],
      data['display_name'],
    )
  }
}

export class Job {
  constructor(
    public id: number,
    public action: string,
    public torrent: string | null,
    public sourceClient: string | null,
    public targetClient: string | null,
    public canExecute: boolean,
    public executeStartTime: Date,
  ) { }

  static fromData(data: any): Job {
    return new Job(
      data['id'],
      data['action'],
      data['torrent'],
      data['source_client'],
      data['target_client'],
      data['can_execute'],
      new Date(data['execute_start_time']),
    )
  }
}

export class AddJob {
  constructor(
    public action: string,
    public torrent?: number,
    public target_client?: number,
    public config?: object,
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class SpreadsheetUIService {
  private urlTorrents = '/api/torrents/';
  private urlTorrentClients = '/api/torrentclients/';
  private urlJobs = '/api/jobs/';

  constructor(private http: HttpClient) { }

  getTorrents(offset: number, limit: number, filterParams: any): Observable<{ torrents: Array<Torrent>, count: number }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    for (let key in filterParams) {
      params = params.set(key, filterParams[key]);
    }

    return this.http.get(this.urlTorrents, { params }).pipe(
      map(r => {
        return {
          torrents: r['results'].map(t => Torrent.fromData(t)),
          count: r['count']
        }
      })
    )
  }

  getTorrentAggregated(filterParams: any) {
    let params = new HttpParams();
    for (let key in filterParams) {
      params = params.set(key, filterParams[key]);
    }
    return this.http.get(`${this.urlTorrents}aggregated/`, { params });

  }

  getTorrentClients(offset: number, limit: number, filterParams: any): Observable<{ clients: Array<TorrentClient>, count: number }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    for (let key in filterParams) {
      params = params.set(key, filterParams[key]);
    }

    return this.http.get(this.urlTorrentClients, { params }).pipe(
      map(r => {
        return {
          clients: r['results'].map(t => TorrentClient.fromData(t)),
          count: r['count']
        }
      })
    )
  }

  getJobs(offset: number, limit: number, filterParams: any): Observable<{ jobs: Array<Job>, count: number }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    for (let key in filterParams) {
      params = params.set(key, filterParams[key]);
    }

    return this.http.get(this.urlJobs, { params }).pipe(
      map(r => {
        return {
          jobs: r['results'].map(t => Job.fromData(t)),
          count: r['count']
        }
      })
    )
  }

  submitJobs(jobs: Array<AddJob>) {
    return this.http.post(`${ this.urlJobs }submit_actions/`, jobs);
  }

  wipeAllJobs() {
    return this.http.post(`${ this.urlJobs }wipe_all_actions/`, {});
  }

  executeAllJobs() {
    return this.http.post(`${ this.urlJobs }execute_all_jobs/`, {});
  }

  scheduleFullUpdate() {
    return this.http.post(`${ this.urlTorrents }schedule_full_update/`, {});
  }

  setTheme(theme: string) {
    localStorage.setItem('themeClass', theme);
  }

  getTheme() {
    return localStorage.getItem('themeClass') || 'ag-theme-balham';
  }
}
