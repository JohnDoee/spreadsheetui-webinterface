import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

class Torrent {
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

  static fromData(data: object): Torrent {
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

@Injectable({
  providedIn: 'root'
})
export class SpreadsheetUIService {
  private urlTorrents = '/api/torrents/';;

  constructor(private http: HttpClient) { }

  getTorrents(offset: number, limit: number, filterParams: object): Observable<{ torrents: Array<Torrent>, count: number }> {
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

  getTorrentStats() {
    return this.http.get(`${this.urlTorrents}stats/`);
  }
}
