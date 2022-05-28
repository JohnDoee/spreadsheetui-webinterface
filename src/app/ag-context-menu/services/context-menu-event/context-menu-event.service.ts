import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ContextMenuOpenEvent } from '../../components/context-menu/context-menu.component.interface';

/**
 * @internal
 */
@Injectable({
  providedIn: 'root',
})
export class ContextMenuEventService<T> {
  public onShow: Subject<ContextMenuOpenEvent<T>> = new Subject();

  public show(options: ContextMenuOpenEvent<T>) {
    this.onShow.next(options);
  }
}
