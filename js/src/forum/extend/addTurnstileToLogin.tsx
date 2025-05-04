import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import LogInModal from 'flarum/forum/components/LogInModal';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToLogin() {
  extend(LogInModal.prototype, 'oninit', function () {
    this.turnstileVersion = 0;
  });

  extend(LogInModal.prototype, 'loginParams', function (data) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;
    data.turnstileToken = this.__turnstileToken;
  });

  extend(LogInModal.prototype, 'fields', function (fields) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;

    fields.add(
      'turnstile',
      <Turnstile
        key={`turnstile-${this.turnstileVersion}`} // ✅ ensure rerender!
        action="log_in"
        onTurnstileStateChange={(token) => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  extend(LogInModal.prototype, 'onerror', function (_, error) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;

    // ✅ Rerender the Turnstile widget by changing the key
    this.turnstileVersion++;
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