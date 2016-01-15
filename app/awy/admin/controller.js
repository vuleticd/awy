import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract.js';

class Awy_Admin_Controller extends Awy_Core_Controller_Abstract {
	constructor() {
		super();
	}

    async action_index(){
    	console.log('Awy_Admin_Controller.action_index');
    	// if logged in 
        let db = await Class.i('awy_core_model_db');
        let authData = db._connection.getAuth();
        //console.log('authData: ', authData);
        if (authData && authData.provider != 'anonymous') {
    	   await this.layout("/");
        } else {
    	   await this.layout("/login");
        }
    }

    async action_password_recover(){
    	await this.layout("/password/recover");
    }
    // replace by binded view helper function
    async action_logout() {
        let admin = await Class.i('awy_admin_model_user');
        await admin.logout();
        let r = await Class.i('awy_core_model_router');
        r.navigate('/admin');
    }

}

export default Awy_Admin_Controller