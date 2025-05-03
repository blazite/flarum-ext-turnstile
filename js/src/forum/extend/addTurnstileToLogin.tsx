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
        onTurnstileStateChange={(token) => {
          this.__turnstileToken = token;
        }}
        ref={el => {
          this.turnstileWidgetRef = el;
        }}
      />,
      -5
    );
  });

  extend(LogInModal.prototype, 'onerror', function (error) {
    const errors = error?.response?.errors ?? [];
    let turnstileErrorShown = false;

    errors.forEach(e => {
      if (
        e.source?.pointer === '/data/attributes/turnstileToken' ||
        (e.detail && e.detail.toLowerCase().includes('turnstile'))
      ) {
        this.alerts.show({ type: 'error' }, e.detail || 'Please complete the Turnstile challenge.');
        turnstileErrorShown = true;
      }
    });

    if (!turnstileErrorShown && errors.length > 0) {
      this.alerts.show({ type: 'error' }, errors[0].detail || 'Login failed.');
    }

    if (this.turnstileWidgetRef && window.turnstile && this.turnstileWidgetRef.widgetId) {
      window.turnstile.reset(this.turnstileWidgetRef.widgetId);
      this.__turnstileToken = null;
      m.redraw();
    }
  });
}