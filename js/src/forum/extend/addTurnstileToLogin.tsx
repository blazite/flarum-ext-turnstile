import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import LogInModal from 'flarum/forum/components/LogInModal';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToLogin() {
  extend(LogInModal.prototype, 'loginParams', function (data) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;
    data.turnstileToken = this.__turnstileToken;
  });

  extend(LogInModal.prototype, 'fields', function (fields) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;

    // bind reset() to modal so we can call it in onerror
    this.turnstile = null;

    fields.add(
      'turnstile',
      <Turnstile
        action="log_in"
        bindParent={this}
        onTurnstileStateChange={(token) => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  extend(LogInModal.prototype, 'onerror', function (_, error) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;

    // properly reset CAPTCHA using Cloudflare API
    if (this.turnstile?.reset) {
      this.turnstile.reset();
    }

    this.__turnstileToken = null;

    if (error.alert && (!error.alert.content || !error.alert.content.length)) {
      error.alert.content =
        app.translator.trans('blazite-turnstile.forum.validation_error') ||
        'Please complete the CAPTCHA.';
    }

    this.alertAttrs = error.alert;
    m.redraw();
    this.onready();
  });
}