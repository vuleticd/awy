import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Install_View_Step3 extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	async completeStep(){

		alert(JSON.stringify(this, null, 4));
		let config = await Class.i('awy_core_model_config');
		config.set('install_status', 'installed', false, true);
    	config.writeLocalStorage('core');
    	window.location.href = '/';
		//let r = await Class.i('awy_core_model_router');
        //r.navigate('/');
	}
}

export default Awy_Install_View_Step3