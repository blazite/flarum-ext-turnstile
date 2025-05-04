import app from 'flarum/forum/app';
import LogInModal from 'flarum/forum/components/LogInModal';
import { extend, override } from 'flarum/common/extend';
import TurnstileState from '../../common/states/TurnstileState';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToLogin() {
  const isEnabled = () => !!app.forum.attribute('blazite-turnstile.signin');

  extend(LogInModal.prototype, 'oninit', function () {
    if (!isEnabled()) return;

    this.turnstile = new TurnstileState(
      () => {}, // Success callback — not needed unless you want behavior
      (alertAttrs) => {
        this.loaded();
        this.alertAttrs = alertAttrs;
      }
    );
  });

  extend(LogInModal.prototype, 'loginParams', function (data) {
    if (!isEnabled()) return;
    data.turnstileToken = this.turnstile.getResponse();
  });

  extend(LogInModal.prototype, 'fields', function (fields) {
    if (!isEnabled()) return;

    fields.add(
      'turnstile',
      <Turnstile state={this.turnstile} />,
      -5
    );
  });

  extend(LogInModal.prototype, 'onerror', function (_, error) {
    if (!isEnabled()) return;
    this.turnstile.reset();

    if (error.alert && (!error.alert.content || !error.alert.content.length)) {
      error.alert.content = app.translator.trans('blazite-turnstile.forum.validation_error');
    }
  });
}