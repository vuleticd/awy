import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Admin_View_Default extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	async logout(){
		let admin = await Class.i('awy_admin_model_user');
        await admin.logout();
        let r = await Class.i('awy_core_model_router');
        r.redirect('/admin');
	}
}

export default Awy_Admin_View_Default