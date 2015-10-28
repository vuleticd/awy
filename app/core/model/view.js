import {Aobject, ObjectRegistry} from 'core/model/aobject';
import Logger from 'core/model/logger';


class Core_Model_View extends Aobject {

	constructor(params) {
		super();
		this._params = params;
	}

	factory(viewName, params = {}) {
        params['view_name'] = viewName;
        let className = params.view_class || this.constructor;
        //console.log(this.constructor);
        //console.log(params);
        let view = ObjectRegistry.getInstance(className, false, params);

        return view;
    }

	setParam(key, value = null) {
        if (typeof key === 'object') {
            for (k in key) {
                this.setParam(k, key[k]);
            }
            return this;
        }
        this._params[key] = value;
		
        return this;
    }

    set(name, value = null) {
        if (typeof name === 'object') {
            for (k in name) {
                this._params['args'][k] = name[k];
            }

            return this;
        }
        if (!('args' in this._params)) {
        	this._params['args'] = {};
        }
        this._params['args'][name] = value;

        return this;
    }
}

export default Core_Model_View