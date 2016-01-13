import Awy_Admin_View_Default from 'awy/admin/view/default.js';

class Awy_Admin_View_Password extends Awy_Admin_View_Default {
	constructor(params) {
		super();
		this._params = params;
		//this.set('agree', false); // default value @todo: fetch from sessionStorage
	}

	async resetPassword(){
		// validation
		let emailEl = document.querySelector("input[name=email]");
		emailEl.parentElement.classList.remove("has-errors");
		this.set('errors', null);
		if (!this.get('email') ) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Please submit all required fields!</li>');
			if (!this.get('email')) {
				emailEl.parentElement.classList.add("has-errors");
			}
			return false;
		}
		alert('resetPassword');
	}

	async back(){
		history.back();
	}
}

export default Awy_Admin_View_Password