import Core_Model_View from 'awy/core/model/view';

class Core_View_Head extends Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}
/*
	url(path = null, full = true, method = 2)
    {
        return $this->BApp->href($path, $full, $method);
    }
    */
}

export default Core_View_Head