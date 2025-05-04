import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import SignUpModal from 'flarum/forum/components/SignUpModal';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToSignUp() {
  extend(SignUpModal.prototype, 'submitData', function (data) {
    if (!app.forum.attribute('blazite-turnstile.signup')) return;
    data.turnstileToken = this.__turnstileToken;
  });

  extend(SignUpModal.prototype, 'fields', function (fields) {
    if (!app.forum.attribute('blazite-turnstile.signup')) return;

    this.turnstile = null;

    fields.add(
      'turnstile',
      <Turnstile
        action="sign_up"
        bindParent={this}
        onTurnstileStateChange={(token) => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  extend(SignUpModal.prototype, 'onerror', function (_, error) {
    if (!app.forum.attribute('blazite-turnstile.signup')) return;

    if (this.turnstile?.reset) {
      this.turnstile.reset();
    }

    if (error.alert && (!error.alert.content || !error.alert.content.length)) {
      error.alert.content =
        app.translator.trans('blazite-turnstile.forum.validation_error') ||
        'Please complete the Turnstile challenge.';
    }

    this.alertAttrs = error.alert;
    m.redraw();
    this.onready();
  });
}
