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
        onTurnstileStateChange={token => {
          this.__turnstileToken = token;
        }}
      />,
      -5
    );
  });

  extend(LogInModal.prototype, 'onerror', function (orig, error) {
    const errors = error?.response?.errors || [];
    this.alerts.dismiss();

    errors.forEach(e => {
      if (typeof e.detail === 'string' && e.detail.length) {
        this.alerts.show({ type: 'error' }, e.detail);
      }
    });

    orig.call(this, error);
  });
}