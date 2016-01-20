import Awy_Admin_View_Default from 'awy/admin/view/default.js';

class Migrate_View extends Awy_Admin_View_Default {
	constructor(params) {
		super();
		this._params = params;
	}

	async execute(){
		// validation
		let keyEl = document.querySelector("input[name=key]");
		keyEl.parentElement.classList.remove("has-errors");
		this.set('errors', null);
		if (!this.get('db_key')) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Please submit Security Key!</li>');
			keyEl.parentElement.classList.add("has-errors");
			return false;
		}

		// submit
		let config = await Class.i('awy_core_model_config');
		config.add({db:{ key: this.get('db_key')} }, false);
    	//config.writeStorage('db');

		try {
			let migri = await Class.i('awy_core_model_migrate');
	        await migri.migrateModules(true);
        } catch(e){
    		this.set('errors', '<li><i class="fa-li fa fa-close"></i>' + e + '</li>');
    		return false;
    	}
	}
}

export default Migrate_View