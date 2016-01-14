import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract.js';

class Awy_Admin_Controller extends Awy_Core_Controller_Abstract {
	constructor() {
		super();
	}

    async action_index(){
    	console.log('Awy_Admin_Controller.action_index');
    	// if logged in 
        let db = await Class.i('awy_core_model_db');
        if (db._connection.getAuth()) {
    	   await this.layout("/");
           db._connection.unauth();
        } else {
    	   await this.layout("/login");
        }
    }

    async action_password_recover(){
    	await this.layout("/password/recover");
    }
}

export default Awy_Admin_Controller