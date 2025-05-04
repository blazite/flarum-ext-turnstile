import Component from 'flarum/common/Component';
import app from 'flarum/forum/app';
import type { VnodeDOM, Vnode } from 'mithril';

interface ITurnstileAttrs {
  action?: string;
  onTurnstileStateChange?: (token: string | null) => void;
  bindParent?: any; // Can be used to inject reset into modal instance
}

export default class Turnstile extends Component<ITurnstileAttrs> {
  widgetId?: string;
  turnstileLoaded!: boolean;

  oninit(vnode: Vnode<ITurnstileAttrs, this>) {
    super.oninit(vnode);
    this.turnstileLoaded = !!window.turnstile;
  }

  get config() {
    const { action } = this.attrs;

    return {
      action,
      theme: this.getCurrentTheme(),
      language: app.translator.getLocale() || 'auto',
      sitekey: app.forum.attribute('blazite-turnstile.site_key'),
      size: 'flexible',
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
        currentTheme = window.matchMedia('(prefers-color-scheme:dark)').matches
          ? Themes.DARK
          : Themes.LIGHT;
      }

      return currentTheme === Themes.DARK ? 'dark' : 'light';
    }

    return !!!app.forum.attribute('turnstile_dark_mode') ? 'light' : 'dark';
  }

  onTurnstileComplete(token: string) {
    this.attrs.onTurnstileStateChange?.(token);
  }

  onTurnstileExpire() {
    if (this.widgetId) window.turnstile.reset(this.widgetId);
    this.attrs.onTurnstileStateChange?.(null);
  }

  onTurnstileError() {
    this.attrs.onTurnstileStateChange?.(null);
  }

  createTurnstile() {
    if (!this.turnstileLoaded) return;
    this.widgetId = window.turnstile.render(this.element, this.config);

    if (this.attrs.bindParent) {
      this.attrs.bindParent.turnstile = {
        reset: () => {
          if (this.widgetId) window.turnstile.reset(this.widgetId);
          this.attrs.onTurnstileStateChange?.(null);
        },
      };
    }
  }

  removeTurnstile() {
    if (!this.turnstileLoaded) return;
    if (this.widgetId) window.turnstile.remove(this.widgetId);
  }

  oncreate(vnode: VnodeDOM<ITurnstileAttrs, this>) {
    super.oncreate(vnode);
    this.createTurnstile();
  }

  onbeforeremove(vnode: VnodeDOM<ITurnstileAttrs, this>) {
    super.onbeforeremove(vnode);
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
