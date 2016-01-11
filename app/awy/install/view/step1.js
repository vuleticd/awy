import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Install_View_Step1 extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	async completeStep(){
		// validation
		let keyEl = document.querySelector("input[name=key]");
		let hostEl = document.querySelector("input[name=host]");
		keyEl.parentElement.classList.remove("has-errors");
		hostEl.parentElement.classList.remove("has-errors");
		this.set('errors', null);
		if (!this.get('db_url') || !this.get('db_key') ) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Please submit all required fields!</li>');
			if (!this.get('db_url')) {
				hostEl.parentElement.classList.add("has-errors");
			}
			if (!this.get('db_key')) {
				keyEl.parentElement.classList.add("has-errors");
			}
			return false;
		}
		// submit
		let config = await Class.i('awy_core_model_config');
		config.add({db:{ host: this.get('db_url'), key: this.get('db_key')} }, true);
    	config.writeStorage('db');

		let migri = await Class.i('awy_core_model_migrate');
		try {
        	await migri.migrateModules(['awy_core', 'awy_admin'], true);
    	} catch(e){
    		this.set('errors', '<li><i class="fa-li fa fa-close"></i>' + e + '</li>');
    		return false;
    	}

        config.saveDbHostConfig();

		let r = await Class.i('awy_core_model_router');
        r.navigate('install/step2');
	}
}

export default Awy_Install_View_Step1