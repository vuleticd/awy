import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract';

class Awy_Core_Controller_Main extends Awy_Core_Controller_Abstract {
	constructor() {
		super();
	}

	async action_initialize_js() {
		console.log('Awy_Core_Controller_Main.action_initialize_js');
        await this.layout('/initialize.js');
    }

    async action_initialize_css() {
    	console.log('Awy_Core_Controller_Main.action_initialize_css');
        await this.layout('/initialize.css');
    }

}

export default Awy_Core_Controller_Main