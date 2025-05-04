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
    if (error.status === 422 && error.response?.errors?.length) {
      const errors = error.response.errors;

      const turnstileError = errors.find((e) => {
        return e.source?.pointer?.includes('turnstileToken') || (e.detail?.toLowerCase().includes('turnstile'));
      });

      const requiredError = errors.find((e) => {
        return e.code === 'validation.required';
      });

      const errorContent = turnstileError
        ? app.translator.trans('validation.turnstile')
        : requiredError
        ? app.translator.trans('validation.required')
        : errors[0]?.detail || app.translator.trans('core.forum.log_in.invalid_login_message');

      this.alertAttrs = {
        type: 'error',
        content: errorContent,
      };

      m.redraw();
      this.onready();

      return;
    }

    original(error);
  });
}