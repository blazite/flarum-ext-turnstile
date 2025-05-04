import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import LogInModal from 'flarum/forum/components/LogInModal';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToLogin() {
  extend(LogInModal.prototype, 'loginParams', function (data) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;
    data.turnstileToken = this.__turnstileToken ?? null;
  });

  extend(LogInModal.prototype, 'fields', function (fields) {
    if (!app.forum.attribute('blazite-turnstile.signin')) return;
    fields.add(
      'turnstile',
      <Turnstile
        action="log_in"
        onTurnstileStateChange={(token) => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  override(LogInModal.prototype, 'onerror', function (original, error) {
    if (error && error.status === 422 && error.response && error.response.errors) {
      const errors = error.response.errors;
      const turnstileError = errors.find(
        (e) =>
          (e.source?.pointer === '/data/attributes/turnstileToken') ||
          (typeof e.detail === 'string' && e.detail.toLowerCase().includes('turnstile'))
      );
      if (turnstileError) {
        error.alert = error.alert || {};
        error.alert.content =
          turnstileError.detail || app.translator.trans('blazite-turnstile.forum.error.required');
        this.alertAttrs = error.alert;
        m.redraw();
        return;
      }
    }

    if (error && error.alert) {
      error.alert.content = app.translator.trans('blazite-turnstile.forum.error.required');
      this.alertAttrs = error.alert;
      m.redraw();
      return;
    }

    original(error);
  });
}