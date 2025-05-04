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
    fields.add(
      'turnstile',
      <Turnstile
        action="log_in"
        onTurnstileStateChange={(token: string | null) => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  extend(LogInModal.prototype, 'onerror', function (_, error) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;

    // If the error status is 422 (validation failed)
    if (error?.status === 422) {
      // If alert.content is not provided or empty, Flarum shows red bar with no message
      if (error.alert && (!error.alert.content || !error.alert.content.length)) {
        error.alert.content = app.translator.trans('blazite-turnstile.forum.validation_error') ||
          'Please complete the CAPTCHA before login.';
      }

      this.alertAttrs = error.alert;
      m.redraw();
      this.onready();
    }
  });
}