import Awy_Admin_Controller_Abstract from 'awy/core/controller/abstract.js';

class Awy_Admin_Controller extends Awy_Admin_Controller_Abstract {
	constructor() {
		super();
	}

    async action_index(){
    	console.log('Awy_Admin_Controller.action_index');
    	await this.layout();
    }
}

export default Awy_Admin_Controller