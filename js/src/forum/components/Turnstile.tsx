import Component from 'flarum/common/Component';

export default class Turnstile extends Component<{ state: any }> {
  oncreate(vnode) {
    super.oncreate(vnode);
    this.attrs.state.render(vnode.dom.querySelector('.cf-turnstile'));
  }

  view() {
    return (
      <div className="Form-group">
        <div className="cf-turnstile" />
      </div>
    );
  }
}
