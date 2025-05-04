import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import ForgotPasswordModal from 'flarum/forum/components/ForgotPasswordModal';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToForgotPassword() {
  extend(ForgotPasswordModal.prototype, 'requestParams', function (data) {
    if (!app.forum.attribute('blazite-turnstile.forgot')) return;
    data.turnstileToken = this.__turnstileToken;
  });

  extend(ForgotPasswordModal.prototype, 'fields', function (fields) {
    if (!app.forum.attribute('blazite-turnstile.forgot')) return;

    this.turnstile = null;

    fields.add(
      'turnstile',
      <Turnstile
        action="forgot_pw"
        bindParent={this}
        onTurnstileStateChange={(token) => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  extend(ForgotPasswordModal.prototype, 'onerror', function (_, error) {
    if (!app.forum.attribute('blazite-turnstile.forgot')) return;

    if (this.turnstile?.reset) {
      this.turnstile.reset();
    }

    if (error.alert && (!error.alert.content || !error.alert.content.length)) {
      error.alert.content =
        app.translator.trans('blazite-turnstile.forum.validation_error') ||
        'Please complete the CAPTCHA challenge.';
    }

    this.alertAttrs = error.alert;
    m.redraw();
    this.onready();
  });
}
