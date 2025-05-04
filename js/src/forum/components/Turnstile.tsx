import Component from 'flarum/common/Component';
import app from 'flarum/forum/app';

export default class Turnstile extends Component<{ state: any }> {
  oncreate(vnode) {
    super.oncreate(vnode);

    const theme = this.detectTheme();

    this.attrs.state.render(vnode.dom.querySelector('.cf-turnstile'), theme);
  }

  detectTheme(): 'light' | 'dark' {
    const getTheme = flarum.extensions['fof-nightmode']?.getTheme;
    const Themes = flarum.extensions['fof-nightmode']?.Themes;

    if (getTheme && Themes) {
      let currentTheme = getTheme();

      if (currentTheme === Themes.AUTO) {
        currentTheme = window.matchMedia('(prefers-color-scheme:dark)').matches ? Themes.DARK : Themes.LIGHT;
      }

      return currentTheme === Themes.DARK ? 'dark' : 'light';
    }

    return !!app.forum.attribute('turnstile_dark_mode') ? 'dark' : 'light';
  }

  view() {
    return (
      <div className="Form-group">
        <div className="cf-turnstile" />
      </div>
    );
  }
}
