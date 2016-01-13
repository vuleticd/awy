import Awy_Admin_View_Default from 'awy/admin/view/default.js';

class Awy_Admin_View_Login extends Awy_Admin_View_Default {
	constructor(params) {
		super();
		this._params = params;
		//this.set('agree', false); // default value @todo: fetch from sessionStorage
	}

	async signIn(){
		// validation
		let usernameEl = document.querySelector("input[name=username]");
		let passwordEl = document.querySelector("input[name=password]");
		usernameEl.parentElement.classList.remove("has-errors");
		passwordEl.parentElement.classList.remove("has-errors");
		this.set('errors', null);
		if (!this.get('username') || !this.get('password') ) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Please submit all required fields!</li>');
			if (!this.get('username')) {
				usernameEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('password')) {
				passwordEl.parentElement.classList.add("has-errors");
			}
			return false;
		}
		alert('Sign In');
	}

	async forgotPassword(){
		let r = await Class.i('awy_core_model_router');
        r.navigate('admin/password/recover');
	}
}

export default Awy_Admin_View_Login