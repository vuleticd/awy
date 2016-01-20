import Awy_Core_Model_View from 'awy/core/model/view.js';

class Install_Index_View extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
		this.set('agree', false); // default value @todo: fetch from sessionStorage
	}

	async completeStep(){
		// validation
		let el = document.querySelector("input[name=agree]");
		el.parentElement.classList.remove("has-errors");
		this.set('errors', null);
		if (!this.get('agree')) {
			this.set('errors', '<li><i class="fa-li fa fa-close"></i>Please tick the agree to our terms and conditions!</li>');
			el.parentElement.classList.add("has-errors");
			return false;
		}
		// submit
		let r = await Class.i('awy_core_model_router');
        r.navigate('install/step1');
	}
}

export default Install_Index_View