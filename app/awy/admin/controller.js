import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract.js';

class Awy_Admin_Controller extends Awy_Core_Controller_Abstract {
	constructor() {
		super();
	}

    async action_index(){
    	console.log('Awy_Admin_Controller.action_index');
    	// if logged in 
        let db = await Class.i('awy_core_model_db');
        if (db._connection === null) {
            await db.connect();
        }
        let authData = db._connection.getAuth();
        //console.log('authData: ', authData);
        if (authData /*&& authData.provider != 'anonymous'*/) {
    	   await this.layout("/");
        } else {
    	   await this.layout("/login");
        }
    }

    async action_migrate(){
        console.log('Awy_Admin_Controller.action_migrate');
        await this.layout('/migrate');
    }

    async action_password_recover(){
    	await this.layout("/password/recover");
    }

    // debug only
    async onAfterDispatch() {
        await super.onAfterDispatch();
        let admin = await Class.i('awy_admin_model_user');
        console.log("ADMIN USER: ", admin);
    }

}

export default Awy_Admin_Controller