import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract.js';

class ChangedFrontendController extends Awy_Core_Controller_Abstract {
	constructor() {
		super();
	}

    async action_custompage(){
    	console.log('ChangedFrontendController.action_custompage');
        await this.layout("/custompage");
    }

}

export default ChangedFrontendController