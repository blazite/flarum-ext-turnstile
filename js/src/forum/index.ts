import app from 'flarum/forum/app';
import extendAuthModalsWithTurnstile from './extendAuthModals';

app.initializers.add('blazite/turnstile', () => {
  extendAuthModalsWithTurnstile();
});
