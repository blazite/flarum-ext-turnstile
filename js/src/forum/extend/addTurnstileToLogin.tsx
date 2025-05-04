import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import LogInModal from 'flarum/forum/components/LogInModal';
import Turnstile from '../components/Turnstile';

export default function addTurnstileToLogin() {
extend(LogInModal.prototype, 'loginParams', function (data) {
if (!!!app.forum.attribute('blazite-turnstile.signin')) return;
data.turnstileToken = this.__turnstileToken;
});

extend(LogInModal.prototype, 'fields', function (fields) {
if (!!!app.forum.attribute('blazite-turnstile.signin')) return;
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
const turnstileError = error.response.errors.find((e) => {
return (
e.source?.pointer?.includes('turnstileToken') ||
(typeof e.detail === 'string' && e.detail.toLowerCase().includes('turnstile'))
);
});

if (turnstileError) {
error.alert = {
type: 'error',
content: app.translator.trans('blazite-turnstile.validation.required') || turnstileError.detail || 'Turnstile validation failed.',
};

this.alertAttrs = error.alert;
m.redraw();
this.onready();
return;
}
}

original(error);
});
}