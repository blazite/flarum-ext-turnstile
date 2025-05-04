import Component from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type { VnodeDOM, Vnode } from 'mithril';

interface ITurnstileAttrs {
  action?: string;
  onTurnstileStateChange?: (token: string | null) => void;
  bindParent?: any;
}

export default class Turnstile extends Component<ITurnstileAttrs> {
  widgetId?: string;
  element!: HTMLElement;
  turnstileLoaded = false;

  oninit(vnode: Vnode<ITurnstileAttrs, this>) {
    super.oninit(vnode);
    this.turnstileLoaded = typeof window.turnstile !== 'undefined';
  }

  get config() {
    return {
      sitekey: app.forum.attribute('blazite-turnstile.site_key'),
      size: 'normal', // Use 'normal', 'compact', or 'invisible' if preferred
      theme: this.getCurrentTheme(),
      action: this.attrs.action ?? 'login',
      callback: this.onTurnstileComplete.bind(this),
      'expired-callback': this.onTurnstileExpire.bind(this),
      'error-callback': this.onTurnstileError.bind(this),
    };
  }

  getCurrentTheme() {
    const getTheme = flarum.extensions['fof-nightmode']?.getTheme;
    const Themes = flarum.extensions['fof-nightmode']?.Themes;
    if (getTheme && Themes) {
      let currentTheme = getTheme();
      if (currentTheme === Themes.AUTO) {
        currentTheme = window.matchMedia('(prefers-color-scheme:dark)').matches ? Themes.DARK : Themes.LIGHT;
      }
      return currentTheme === Themes.DARK ? 'dark' : 'light';
    }

    return !!!app.forum.attribute('turnstile_dark_mode') ? 'light' : 'dark';
  }

  onTurnstileComplete(token: string) {
    this.attrs.onTurnstileStateChange?.(token);
  }

  onTurnstileExpire() {
    this.attrs.onTurnstileStateChange?.(null);
  }

  onTurnstileError() {
    this.attrs.onTurnstileStateChange?.(null);
  }

  createTurnstile() {
    if (!this.turnstileLoaded) return;

    // remove any existing widget if already on node
    this.removeTurnstile();

    this.widgetId = window.turnstile.render(this.element, this.config);

    if (this.attrs.bindParent) {
      this.attrs.bindParent.turnstile = {
        reset: () => {
          if (this.widgetId) {
            window.turnstile.reset(this.widgetId);
            this.attrs.onTurnstileStateChange?.(null);
          }
        },
      };
    }
  }

  removeTurnstile() {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
      this.widgetId = undefined;
    }
  }

  oncreate(vnode: VnodeDOM<ITurnstileAttrs, this>): void {
    super.oncreate(vnode);
    this.element = vnode.dom as HTMLElement;
    this.createTurnstile();
  }

  onupdate() {
    // Optional: re-render if needed due to change
  }

  onbeforeremove() {
    this.removeTurnstile();
  }

  view() {
    if (!this.turnstileLoaded) {
      return (
        <p class="BlaziteTurnstile-notLoaded">
          {app.translator.trans('blazite-turnstile.forum.not_loaded_error')}
        </p>
      );
    }

    return <div class="Blazite-Turnstile Form-group" />;
  }
}