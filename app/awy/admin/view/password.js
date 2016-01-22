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
			emailEl.parentElement.classList.add("has-errors");
			return false;
		}
		// submit
		try {
			let admin = await Class.i('awy_admin_model_user');
			await admin.resetPassword(this.get('email'));
			alert('Password reset email sent successfully!');
			let r = await Class.i('awy_core_model_router');
        	r.navigate('admin');
		} catch(e){
    		this.set('errors', '<li><i class="fa-li fa fa-close"></i>' + e + '</li>');
    		return false;
    	}
	}

	async back(){
		history.back();
	}
}

export default Awy_Admin_View_Password