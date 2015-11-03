// run_level
const DISABLED  = 'DISABLED'; // Do not allow the module to be loaded
const ONDEMAND  = 'ONDEMAND'; // Load this module only when required by another module
const REQUESTED = 'REQUESTED'; // Attempt to load the module, and silently ignore, if dependencies are not met.
const REQUIRED  = 'REQUIRED'; // Attempt to load the module, and fail, if dependencies are not met.

// run_status
const IDLE    = 'IDLE'; // The module was found, but not loaded
const PENDING = 'PENDING'; // The module is marked to be loaded, but not loaded yet. This status is currently used during internal bootstrap only.
const LOADED  = 'LOADED'; // The module has been loaded successfully
const ERROR   = 'ERROR'; // There was an error loading the module due to unmet dependencies

class Core_Model_Module extends Class {
	


	constructor(params: Object) {
		super();
		this._defaultRunLevel = 'ONDEMAND';
		this.run_level = this._defaultRunLevel;
        this.logger = Class.i('Core_Model_Logger', 'Module');
        Class.i('Core_Model_Router_Request').then(r => {
        	params['area'] = r.area;
        	this.set(params);
	        if (!('run_status' in this)) {
	            this.run_status = IDLE;
	        }

	        if (!('channel' in this)) {
	            this.channel = 'alpha';
	        }
        });
    }

    set(key, value = null) {
        if (typeof key === 'object') {
            for (let param in key) {
                this[param] = key[param];
            }
            return this;
        }
        this[key] = value;
        
        return this;
    }
}

export default Core_Model_Module