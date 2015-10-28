import {Aobject} from 'core/model/aobject';
import Logger from 'core/model/logger';
import View from 'core/model/view';


class Core_Model_Layout extends Aobject {
	constructor() {
		super();
		// Default class name for newly created views
		this._defaultViewClass = false;
		// View objects registry
    	this.views = {};
    	// Main (root) view to be rendered first
    	this._rootViewName = 'root';
	}

	set defaultViewClass(viewClass) {
        this._defaultViewClass = viewClass;
        return this;
    }

    get defaultViewClass(){
        return this._defaultViewClass;
    }

    set rootView(viewName) {
        this._rootViewName = viewName;
        return this;
    }

    get rootViewName() {
        return this._rootViewName;
    }

    get rootView() {
        return this._rootViewName ? this.getView(this._rootViewName) : null;
    }

    view(viewName) {
        return this.views[viewName] || null/*$this->BViewEmpty->i(true)->setParam('view_name', $viewName)*/;
    }

	addView(viewName, params = {}, reset = false) {
        if (typeof params === 'string') {
            params = {view_class: params};
        }
        /*
        if (empty($params['module_name']) && ($moduleName = $this->BModuleRegistry->currentModuleName())) {
            $params['module_name'] = $moduleName;
        }
        */
        let viewAlias = params.view_alias || viewName;
        let viewFile = params.view_file || viewName;
        if (!(viewAlias in this.views) || ('view_class' in params)) {
            if (!('view_class' in params)) {
                if (this._defaultViewClass) {
                    params['view_class'] = this._defaultViewClass;
                }
            }
        
            this.views[viewAlias] = View.i(true).factory(viewFile, params);
            //console.log(this.views[viewAlias]);

        } else {
            this.views[viewAlias].setParam(params);
        }

        return this;
    }
}

export default Core_Model_Layout