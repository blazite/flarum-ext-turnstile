import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
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
/>,
-5
);
});

override(LogInModal.prototype, 'onerror', function (original, error) {
if (error.status === 422 && error.response?.errors?.length) {
const firstError = error.response.errors[0];

if (!this.alertAttrs) {
this.alertAttrs = {
type: 'error',
content: app.translator.trans(firstError.detail || 'validation.required'),
};
}

m.redraw();
this.onready();

return;
}

original(error);
});
}