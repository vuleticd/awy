import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract.js';

class FrontendController extends Awy_Core_Controller_Abstract {
	constructor() {
		super();
	}

    async action_index(){
    	console.log('FrontendController.action_index');
        await this.layout("/");
    }

    async action_noroute(){
        console.log('FrontendController.action_noroute');
        await this.layout("404");
        //$this->BResponse->status(404);
    }

}

export default FrontendController