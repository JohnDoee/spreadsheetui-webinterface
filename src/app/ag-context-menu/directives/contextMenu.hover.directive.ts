import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[context-menu-hover]',
})
export class ContextMenuHoverDirective {
  @Input('context-menu-hover') public hoverClass: any;

  constructor(private el: ElementRef) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.classList.add(this.hoverClass);
 }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.classList.remove(this.hoverClass);
  }
}
