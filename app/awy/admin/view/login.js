import Awy_Admin_View_Default from 'awy/admin/view/default.js';

class Awy_Admin_View_Login extends Awy_Admin_View_Default {
	constructor(params) {
		super();
		this._params = params;
	}

	async signIn(){
		this.set('spin', '<i class="fa fa-spinner fa-pulse"></i>');
		// validation
		let emailEl = document.querySelector("input[name=email]");
		let passwordEl = document.querySelector("input[name=password]");
		emailEl.parentElement.classList.remove("has-errors");
		passwordEl.parentElement.classList.remove("has-errors");
		this.set('errors', null);
		if (!this.get('email') || !this.get('password') ) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Please submit all required fields!</li>');
			if (!this.get('email')) {
				emailEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('password')) {
				passwordEl.parentElement.classList.add("has-errors");
			}
			this.set('spin', '');
			return false;
		}

		//submit
		let loginEmail = this.get('email');
		let db = await Class.i('awy_core_model_db');
		let admin = await Class.i('awy_admin_model_user');
		try {
			let authData = await admin.auth(loginEmail, this.get('password'));
			db._config['key'] = authData.token;
		    let config = await Class.i('awy_core_model_config');
		    config.writeLocalStorage('db', db._config);
		    let r = await Class.i('awy_core_model_router');
        	r.redirect('/admin');
		} catch(e) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>'+e.message+'</li>');
			switch (e.code) {
		      case "INVALID_PASSWORD":
		        passwordEl.parentElement.classList.add("has-errors");
		        break;
		      default:
				emailEl.parentElement.classList.add("has-errors");
		    }
		    this.set('spin', '');
			return false;
		}
	}

	async forgotPassword(){
		let r = await Class.i('awy_core_model_router');
        r.navigate('admin/password/recover');
	}
}

export default Awy_Admin_View_Login