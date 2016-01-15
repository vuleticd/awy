import Awy_Admin_View_Default from 'awy/admin/view/default.js';

class Awy_Admin_View_Login extends Awy_Admin_View_Default {
	constructor(params) {
		super();
		this._params = params;
		//this.set('agree', false); // default value @todo: fetch from sessionStorage
	}

	async signIn(){
		this.set('spin', '<i class="fa fa-spinner fa-pulse"></i>');
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
			this.set('spin', '');
			return false;
		}

		//submit
		let loginEmail = this.get('username');
		let vertex = await ClassRegistry.getInstance('awy_core_util_vertex');		
		let testerEmail = vertex.find( "@" ).test(this.get('username')); // simple one
		//let testerEmail = vertex.startOfLine().anythingBut( "@" ).next( "@" ).anythingBut( "." ).next( "." ).anythingBut( " " ).endOfLine();
		let db = await Class.i('awy_core_model_db');
		if (!testerEmail) {
	 		let checkUsername = await db.rget('admin_user', null, {"orderBy": "username", "equalTo": this.get('username') });
	 		let testUser = JSON.parse(checkUsername); // {} || {"uid": {...}}
	 		if (!Object.keys(testUser).length) {
	 			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Invalid username!</li>');
				if (!this.get('username')) {
					usernameEl.parentElement.classList.add("has-errors");
				}
				this.set('spin', '');
				return false;
	 		}

	 		let uid = Object.keys(testUser).shift();
	 		loginEmail = testUser[uid]['email'];
	 	}

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
				usernameEl.parentElement.classList.add("has-errors");
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