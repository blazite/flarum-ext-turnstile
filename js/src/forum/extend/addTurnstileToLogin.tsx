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
    let found = false;

    for (const e of errors) {
      if (
        e.source?.pointer === '/data/attributes/turnstileToken' ||
        (typeof e.detail === 'string' &&
            e.detail.toLowerCase().includes('turnstile'))
      ) {
        this.alerts.show(
          { type: 'error' },
          e.detail || 'Please complete the Turnstile challenge.'
        );
        found = true;
      }
    }

    if (!found && errors.length) {
      this.alerts.show({ type: 'error' }, errors[0].detail || 'Login failed.');
    }

    orig.call(this, error);
  });
}