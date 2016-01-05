import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Install_View_Step2 extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	async completeStep(){
		// validation
		let firstnameEl = document.querySelector("input[name=firstname]");
		let lastnameEl = document.querySelector("input[name=lastname]");
		let emailEl = document.querySelector("input[name=email]");
		let usernameEl = document.querySelector("input[name=username]");
		let passwordEl = document.querySelector("input[name=password]");
		let password_confirmEl = document.querySelector("input[name=password_confirm]");
		firstnameEl.parentElement.classList.remove("has-errors");
		lastnameEl.parentElement.classList.remove("has-errors");
		emailEl.parentElement.classList.remove("has-errors");
		usernameEl.parentElement.classList.remove("has-errors");
		passwordEl.parentElement.classList.remove("has-errors");
		password_confirmEl.parentElement.classList.remove("has-errors");
		this.set('errors', null);

		if (!this.get('firstname') || !this.get('lastname') || !this.get('email') || !this.get('username') || !this.get('password') || !this.get('password_confirm')) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Please submit all required fields!</li>');
			if (!this.get('firstname')) {
				firstnameEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('lastname')) {
				lastnameEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('email')) {
				emailEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('username')) {
				usernameEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('password')) {
				passwordEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('password_confirm')) {
				password_confirmEl.parentElement.classList.add("has-errors");
			}
			return false;
		}

		if (this.get('password') !== this.get('password_confirm')) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Passwords are not identical!</li>');
			passwordEl.parentElement.classList.add("has-errors");
			password_confirmEl.parentElement.classList.add("has-errors");
			return false;
		}
		// submit
		let r = await Class.i('awy_core_model_router');
        r.navigate('install/step3');
	}
}

export default Awy_Install_View_Step2