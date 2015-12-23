import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Install_View_Step1 extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	completeStep(){
		alert(JSON.stringify(this, null, 4));
		let router = Class.i('awy_core_model_router').then( r => {
            r.navigate('install/step2');
        });
	}
}

export default Awy_Install_View_Step1