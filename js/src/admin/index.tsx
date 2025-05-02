import app from 'flarum/admin/app';

app.initializers.add('blazite/flarum-turnstile', () => {
  app.extensionData
    .for('blazite-turnstile')
    .registerSetting({
      setting: 'blazite-turnstile.site_key',
      type: 'text',
      label: app.translator.trans('blazite-turnstile.admin.settings.site_key'),
      help: app.translator.trans('blazite-turnstile.admin.settings.help_text', {
        a: <a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank" rel="noopener" />,
      }),
    })
    .registerSetting({
      setting: 'blazite-turnstile.secret_key',
      type: 'text',
      label: app.translator.trans('blazite-turnstile.admin.settings.secret_key'),
    })
    .registerSetting({
      setting: 'blazite-turnstile.signup',
      type: 'bool',
      label: app.translator.trans('blazite-turnstile.admin.settings.signup'),
    })
    .registerSetting({
      setting: 'blazite-turnstile.signin',
      type: 'bool',
      label: app.translator.trans('blazite-turnstile.admin.settings.signin'),
    })
    .registerSetting({
      setting: 'blazite-turnstile.forgot',
      type: 'bool',
      label: app.translator.trans('blazite-turnstile.admin.settings.forgot'),
    });
});
