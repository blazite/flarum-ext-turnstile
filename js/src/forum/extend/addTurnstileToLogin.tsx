import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import LogInModal from 'flarum/forum/components/LogInModal';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToLogin() {
  // Extend loginParams to include Turnstile token
  extend(LogInModal.prototype, 'loginParams', function (params) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;
    params.turnstileToken = this.__turnstileToken;
  });

  // Add the Turnstile widget to the modal
  extend(LogInModal.prototype, 'fields', function (fields) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;

    this.turnstile = null;

    fields.add(
      'turnstile',
      <Turnstile
        action="log_in"
        bindParent={this} // allows access to this.turnstile.reset()
        onTurnstileStateChange={(token: string | null) => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  // 🚨 OVERRIDE onerror to handle all errors (401, 422, etc.)
  override(LogInModal.prototype, 'onerror', function (original, error) {
    if (!app.forum.attribute('blazite-turnstile.signin')) {
      return original(error);
    }

    // ✅ Reset CAPTCHA
    if (this.turnstile?.reset) {
      this.turnstile.reset();
    }

    // ✅ Clear used token
    this.__turnstileToken = null;

    // ✅ Set fallback alert content if missing
    if (error.alert && (!error.alert.content || !error.alert.content.length)) {
      error.alert.content = app.translator.trans('blazite-turnstile.forum.validation_error');
    }

    original(error); // call base handler
  });
}