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
    if (error?.status === 422 && error.response?.errors?.length > 0) {
      const errors = error.response.errors;

      const relevantError = errors.find(
        (err) =>
          err.source?.pointer?.includes('turnstileToken') ||
          err.code?.includes('validation') ||
          err.detail?.toLowerCase().includes('turnstile')
      );

      let message = '';

      if (relevantError) {
        if (relevantError.code === 'validation.required') {
          message = app.translator.trans('validation.turnstile');
        } else if (relevantError.code?.startsWith('validation.')) {
          message = app.translator.trans(relevantError.code);
        } else if (relevantError.detail) {
          message = relevantError.detail;
        }
      }

      if (!message) {
        message = app.translator.trans('validation.turnstile');
      }

      this.alertAttrs = {
        type: 'error',
        content: message,
      };

      m.redraw();
      this.onready();
      return;
    }

    original(error);
  });
}