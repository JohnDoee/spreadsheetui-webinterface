import { OverlayModule } from '@angular/cdk/overlay';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator';
import { ContextMenuContentComponent } from '../../components/context-menu-content/context-menu-content.component';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { ContextMenuItemDirective } from '../../directives/context-menu-item/context-menu-item.directive';
import { ContextMenuService } from '../../services/context-menu/context-menu.service';
import { ContextMenuDirective } from './context-menu.directive';

describe('Integ: ContextMenuDirective', () => {
  let host: SpectatorHost<ContextMenuDirective<unknown>>;

  const createHost = createHostFactory({
    component: ContextMenuDirective,
    declarations: [
      ContextMenuItemDirective,
      ContextMenuComponent,
      ContextMenuContentComponent,
    ],
    providers: [ContextMenuService],
    imports: [OverlayModule],
    shallow: false,
    detectChanges: true,
  });

  afterEach(() => {
    host.fixture.destroy();
  });

  it('should render', () => {
    host = createHost('<div contextMenu></div>');
    expect(host.queryHost(ContextMenuDirective)).toExist();
  });

  describe('with menu items', () => {
    it('should open context menu', () => {
      host = createHost(
        `
        <div [contextMenu]="static" tabindex="1" [contextMenuValue]="item">Right click</div>
        <context-menu #static>
          <ng-template contextMenuItem [visible]="true" [disabled]="true">A</ng-template>
          <ng-template contextMenuItem [visible]="false"                 >B</ng-template>
          <ng-template contextMenuItem [divider]="true"                  >C</ng-template>
          <ng-template contextMenuItem [visible]="true" [disabled]="false" [subMenu]="subMenu">D</ng-template>
          <context-menu #subMenu>
            <ng-template contextMenuItem [visible]="true">DD</ng-template>
          </context-menu>
        </context-menu>
    `,
        { hostProps: { item: { id: 'item-id' } } }
      );
      host.dispatchMouseEvent(host.debugElement, 'contextmenu');
      expect(
        host.query('.cdk-overlay-container context-menu-content', {
          root: true,
        })
      ).toExist();
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(1)',
          {
            root: true,
          }
        )
      ).toHaveClass('disabled');
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(2)',
          {
            root: true,
          }
        )
      ).toHaveClass('divider');
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(2)',
          {
            root: true,
          }
        )
      ).toHaveAttribute('role', 'separator');
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(3) button',
          {
            root: true,
          }
        )
      ).toHaveAttribute('aria-haspopup');
    });

    it('should navigate the menu on arrow keys', () => {
      host = createHost(
        `
        <div [contextMenu]="static" [contextMenuValue]="item">Right click</div>
        <context-menu #static>
          <ng-template contextMenuItem [visible]="true"                    >A</ng-template>
          <ng-template contextMenuItem [visible]="true"                    >B</ng-template>
          <ng-template contextMenuItem [divider]="true"                    >C</ng-template>
          <ng-template contextMenuItem [visible]="true" [subMenu]="subMenu">D</ng-template>
          <context-menu #subMenu>
            <ng-template contextMenuItem [visible]="true">DD</ng-template>
          </context-menu>
        </context-menu>
    `,
        { hostProps: { item: { id: 'item-id' } } }
      );
      host.dispatchMouseEvent(host.debugElement, 'contextmenu');
      host.dispatchKeyboardEvent(host.debugElement, 'keydown', {
        key: 'ArrowDown',
        keyCode: 40,
      });
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(1)',
          {
            root: true,
          }
        )
      ).toHaveClass('active');
      host.dispatchKeyboardEvent(host.debugElement, 'keydown', {
        key: 'ArrowDown',
        keyCode: 40,
      });
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(2)',
          {
            root: true,
          }
        )
      ).toHaveClass('active');
      host.dispatchKeyboardEvent(host.debugElement, 'keydown', {
        key: 'ArrowDown',
        keyCode: 40,
      });
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(4)',
          {
            root: true,
          }
        )
      ).toHaveClass('active');
      expect(
        host.query(
          '.cdk-overlay-container .cdk-overlay-connected-position-bounding-box:nth-child(2)',
          {
            root: true,
          }
        )
      ).not.toExist();
      host.dispatchKeyboardEvent(host.debugElement, 'keydown', {
        key: 'ArrowRight',
        keyCode: 39,
      });
      expect(
        host.query(
          '.cdk-overlay-container context-menu-content .ngx-contextmenu li:nth-child(4)',
          {
            root: true,
          }
        )
      ).toHaveClass('active');
      expect(
        host.query(
          '.cdk-overlay-container .cdk-overlay-connected-position-bounding-box:nth-child(2)',
          {
            root: true,
          }
        )
      ).toExist();
      host.dispatchKeyboardEvent(host.debugElement, 'keydown', {
        key: 'ArrowLeft',
        keyCode: 37,
      });
    });
  });
});
