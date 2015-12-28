import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Install_View_Step2 extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;

		this.set('firstname', '');
		this.set('lastname', '');
		this.set('email', '');
		this.set('username', '');
		this.set('password', '*******');
		this.set('password_confirm', '');
	}

	async completeStep(){
		if (!this.get('username') || !this.get('email') ) {
			alert('Please submit all required fields!');
			return false;
		}

		alert(JSON.stringify(this, null, 4));
		let router = Class.i('awy_core_model_router').then( r => {
            r.navigate('install/step3');
        });
	}
}

export default Awy_Install_View_Step2