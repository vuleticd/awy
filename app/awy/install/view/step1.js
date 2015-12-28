import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Install_View_Step1 extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;

		this.set('db_url', 'Your Firebase DB URL');
		this.set('db_key', 'Your Firebase Secure Key');
	}

	completeStep(){
		if (!this.get('db_url') || !this.get('db_key') ) {
			alert('Please submit all required fields!');
			return false;
		}

		alert(JSON.stringify(this, null, 4));
		let router = Class.i('awy_core_model_router').then( r => {
            r.navigate('install/step2');
        });
	}
}

export default Awy_Install_View_Step1