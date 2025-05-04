import app from 'flarum/forum/app';

export default class TurnstileState {
  token = null;
  widgetId = undefined;
  callback;
  errorCallback;

  constructor(callback, errorCallback) {
    this.callback = callback;
    this.errorCallback = errorCallback;
  }

  render(element) {
    if (!window.turnstile) return;

    this.widgetId = window.turnstile.render(element, {
      sitekey: app.forum.attribute('blazite-turnstile.site_key'),
      theme: app.forum.attribute('turnstile_dark_mode') ? 'dark' : 'light',
      size: 'normal',
      callback: (token) => {
        this.token = token;
        this.callback(token);
      },
      'expired-callback': () => {
        this.token = null;
      },
      'error-callback': () => {
        this.token = null;
        this.errorCallback({
          type: 'error',
          content: app.translator.trans('blazite-turnstile.forum.error'),
        });
      },
    });
  }

  getResponse() {
    return this.token;
  }

  reset() {
    if (this.widgetId) {
      window.turnstile.reset(this.widgetId);
      this.token = null;
    }
  }

  isReady() {
    return typeof window.turnstile !== 'undefined';
  }
}