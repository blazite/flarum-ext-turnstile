import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
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

  override(LogInModal.prototype, 'onerror', function (original, error) {
    if (error?.status === 422 && Array.isArray(error.response?.errors)) {
      const errors = error.response.errors;


      const turnstileError = errors.find((e) =>
        e.source?.pointer?.includes('turnstileToken')
      );

      const message = app.translator.trans('validation.turnstile');

      if (turnstileError) {
        this.alertAttrs = {
          type: 'error',
          content: message || 'CAPTCHA failed or incomplete',
        };
        m.redraw();
        this.onready();
        return;
      }
    }

    original(error);
  });
}