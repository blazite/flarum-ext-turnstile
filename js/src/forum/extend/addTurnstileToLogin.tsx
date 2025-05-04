import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
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
        onTurnstileStateChange={token => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  LogInModal.prototype.onerror = function (error) {
    const errors = (error?.response?.errors as any[]) ?? [];
    this.alerts.dismiss();

    if (
      errors.length === 1 &&
      (
        errors[0].source?.pointer === '/data/attributes/turnstileToken' ||
        (typeof errors[0].detail === 'string' && errors[0].detail.toLowerCase().includes('turnstile'))
      )
    ) {
      this.alerts.show(
        { type: 'error' },
        errors[0].detail || app.translator.trans('blazite-turnstile.forum.error.required')
      );
    } else if (errors.length) {
      this.alerts.show({ type: 'error' }, errors[0].detail);
    } else {
      this.alerts.show(
        { type: 'error' },
        app.translator.trans('core.forum.log_in.invalid_login_message')
      );
    }
    this.loaded();
  };
}