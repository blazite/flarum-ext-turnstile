import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import ForgotPasswordModal from 'flarum/forum/components/ForgotPasswordModal';
import LogInModal from 'flarum/forum/components/LogInModal';
import SignUpModal from 'flarum/forum/components/SignUpModal';

import TurnstileState from '../common/states/TurnstileState';
import Turnstile from './components/Turnstile';

const addTurnstileToAuthModal = <T extends typeof ForgotPasswordModal | typeof LogInModal | typeof SignUpModal>({
  modal,
  type,
  dataMethod,
}: {
  modal: T;
  type: 'forgot' | 'signin' | 'signup';
  dataMethod: 'requestParams' | 'loginParams' | 'submitData';
}) => {
  const isEnabled = () => !!app.forum.attribute(`blazite-turnstile.${type}`);

  extend(modal.prototype, 'oninit', function () {
    if (!isEnabled()) return;

    this.turnstile = new TurnstileState(
      () => {},
      (alertAttrs) => {
        this.loaded?.();
        this.alertAttrs = alertAttrs;
      }
    );
  });

  extend(modal.prototype, dataMethod, function (data) {
    if (!isEnabled()) return;
    data.turnstileToken = this.turnstile.getResponse();
  });

  extend(modal.prototype, 'fields', function (fields) {
    if (!isEnabled()) return;
    fields.add('turnstile', <Turnstile state={this.turnstile} />, -5);
  });

  extend(modal.prototype, 'onerror', function (_, error) {
    if (!isEnabled()) return;

    this.turnstile.reset();

    if (error.alert && (!error.alert.content || !error.alert.content.length)) {
      error.alert.content = app.translator.trans('blazite-turnstile.forum.validation_error');
    }

    this.alertAttrs = error.alert;
    m.redraw();
    this.onready?.();
  });
};

export default function extendAuthModalsWithTurnstile() {
  addTurnstileToAuthModal({
    modal: ForgotPasswordModal,
    type: 'forgot',
    dataMethod: 'requestParams',
  });

  addTurnstileToAuthModal({
    modal: LogInModal,
    type: 'signin',
    dataMethod: 'loginParams',
  });

  addTurnstileToAuthModal({
    modal: SignUpModal,
    type: 'signup',
    dataMethod: 'submitData',
  });
}
