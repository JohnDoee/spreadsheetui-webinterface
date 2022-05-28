import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { ContextMenuEventService } from '../../services/context-menu-event/context-menu-event.service';

@Directive({
  selector: '[contextMenu]',
})
export class ContextMenuDirective<T> {
  /**
   * The value related to the context menu
   */
  @Input()
  public contextMenuValue?: T;

  /**
   * The component holding the menu item directive templates
   */
  @Input()
  public contextMenu?: ContextMenuComponent<T>;

  /**
   * The directive must have a tabindex for being accessible
   */
  @Input()
  @HostBinding('attr.tabindex')
  public tabindex: string | number = '0';

  /**
   * Accessibility
   *
   * @internal
   */
  @HostBinding('attr.aria-haspopup')
  public ariaHasPopup = 'true';

  constructor(private contextMenuEventService: ContextMenuEventService<T>) {}

  /**
   * @internal
   */
  @HostListener('contextmenu', ['$event'])
  public onContextMenu(event: MouseEvent): void {
    if (this.contextMenu && !this.contextMenu.disabled) {
      this.contextMenuEventService.show({
        anchoredTo: 'position',
        contextMenu: this.contextMenu,
        x: event.clientX,
        y: event.clientY,
        value: this.contextMenuValue,
      });
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
