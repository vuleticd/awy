import CoreView from 'awy/core/model/view.js';

class IndexView extends CoreView {
	constructor(params) {
		super();
		this._params = params;
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
        r.navigate('install/s1');
	}
}
export default IndexView