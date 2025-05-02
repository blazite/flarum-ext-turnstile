import app from 'flarum/forum/app';
import addTurnstileToForgotPassword from './extend/addTurnstileToForgotPassword';
import addTurnstileToChangePassword from './extend/addTurnstileToChangePassword';
import addTurnstileToLogin from './extend/addTurnstileToLogin';
import addTurnstileToSignUp from './extend/addTurnstileToSignUp';

app.initializers.add('blazite/flarum-turnstile', () => {
  addTurnstileToSignUp();
  addTurnstileToLogin();
  addTurnstileToForgotPassword();
  addTurnstileToChangePassword();
});
