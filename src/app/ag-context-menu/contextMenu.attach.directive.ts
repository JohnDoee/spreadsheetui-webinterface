import { ContextMenuComponent } from './contextMenu.component';
import { ContextMenuService } from './contextMenu.service';
import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[agContextMenu]',
})
export class ContextMenuAttachDirective {
  @Input() public contextMenuSubject: any;
  @Input() public agContextMenu: ContextMenuComponent;

  constructor(private el: ElementRef, private contextMenuService: ContextMenuService) { }

  @HostListener('contextmenu', ['$event'])
  public onContextMenu(event: MouseEvent): void {
    if (!this.agContextMenu.disabled) {
      this.contextMenuService.show.next({
        contextMenu: this.agContextMenu,
        event,
        item: this.contextMenuSubject,
      });
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
