import app from 'flarum/forum/app';
import LogInModal from 'flarum/forum/components/LogInModal';
import Turnstile from '../components/Turnstile';
import { extend } from 'flarum/common/extend';

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

    if (errors.length) {
      for (const e of errors) {
        if (typeof e.detail === 'string' && e.detail.length) {
          this.alerts.show({ type: 'error' }, e.detail);
        }
      }
    } else {
      this.alerts.show(
        { type: 'error' },
        app.translator.trans('core.forum.log_in.invalid_login_message')
      );
    }
    this.loaded();
  };
}