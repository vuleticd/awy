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

		let testUser = {};
		let testUsername = false;
		let vertex = await ClassRegistry.getInstance('awy_core_util_vertex');		
		let testerEmail = vertex.find( "@" ).test(this.get('username')); // simple one
		//let testerEmail = vertex.startOfLine().anythingBut( "@" ).next( "@" ).anythingBut( "." ).next( "." ).anythingBut( " " ).endOfLine();
	 	let db = await Class.i('awy_core_model_db');
	 	if (testerEmail) {
	 		let checkEmail = await db.rget('admin_user', null, {"orderBy": "email", "equalTo": this.get('username') });
	 		testUser = JSON.parse(checkEmail); // {} || {"username": {...}}
	 		testUsername = Object.keys(testUser).length; //  0 || 1
	 	} else {
	 		let checkUsername = await db.rget('admin_user/' + this.get('username'));
	 		testUser = JSON.parse(checkUsername); // null || object 
	 		testUsername = testUser;
	 	}
	 	if (!(!!testUsername)){
	 		this.set('errors', '<li><i class="fa-li fa fa-close"></i>Invalid username or email!</li>');
			if (!this.get('username')) {
				usernameEl.parentElement.classList.add("has-errors");
			}
			return false;
	 	}

	 	let nesting = Object.keys(testUser);
	 	let testPassword = false;
	 	let loginEmail = null;
	 	if (nesting.length == 1) {
	 		loginEmail = testUser[nesting[0]]['email'];
	 		testPassword = testUser[nesting[0]]['password'];
	 	} else {
	 		loginEmail = testUser['email'];
	 		testPassword = testUser['password'];
	 	}
	 	if (testPassword !== this.get('password')) {
	 		this.set('errors', '<li><i class="fa-li fa fa-close"></i>Invalid password!</li>');
			if (!this.get('password')) {
				passwordEl.parentElement.classList.add("has-errors");
			}
			return false;
	 	}

	 	alert('OK, you can log in now with email: ' + loginEmail + " and password: " + testPassword);
	 	db._connection.authWithPassword({
		  email    : loginEmail,
		  password : testPassword
		}, async function(error, authData) {
		  if (error) {
		    switch (error.code) {
		      case "INVALID_EMAIL":
		        console.log("The specified user account email is invalid.");
		        break;
		      case "INVALID_PASSWORD":
		        console.log("The specified user account password is incorrect.");
		        break;
		      case "INVALID_USER":
		        console.log("The specified user account does not exist.");
		        break;
		      default:
		        console.log("Error logging user in:", error);
		    }
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		    db._config['key'] = authData.token;
		    let config = await Class.i('awy_core_model_config');
		    config.writeLocalStorage('db', db._config);
		  }
		});
	}

	async forgotPassword(){
		let r = await Class.i('awy_core_model_router');
        r.navigate('admin/password/recover');
	}
}

export default Awy_Admin_View_Login