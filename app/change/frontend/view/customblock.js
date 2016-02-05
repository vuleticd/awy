import Awy_Core_Model_View from 'awy/core/model/view.js';

class Changed_View extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	async forwardToCustomPage(){
		let r = await Class.i('awy_core_model_router');
        r.navigate('custompage');
	}
}

export default Changed_View