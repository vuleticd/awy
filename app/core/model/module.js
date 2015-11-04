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
        this.errors = [];
        this.errors_propagated = false;
        this.parents = [];
        this.children = [];
        this.children_copy = [];
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

    // Promise !!!!!
    processDefaultConfig() {
        if ('default_config' in this) {
            Class.i('Core_Model_Config').then(cfgHlp => {
                for (let path in this.default_config) {
                    if (this.strpos(path, '/') !== false) {
                        let value = this.default_config[path];
                        console.log(value);
                        cfgHlp.set(path, value);
                        delete this.default_config[path];
                    }
                    
                }
                cfgHlp.add(this.default_config);
            });
        }
        // Promise !!!!!
        this.processThemes();
        return this;
    }
    // Promise !!!!!
    processThemes() {
        //TODO: automatically enable theme module when it is used
        if (this.run_status === 'PENDING' && 'themes' in this) {
            console.log('processThemes');
            for (let name in this.themes) {
                let params = this.themes[name];
                console.log(name);
                console.log(params);
                if ('module_name' in params && 'area' in params) {
                    params['module_name'] = this.module_name;
                    //$this->BLayout->addTheme($name, $params, $this->name);
                } else {
                    //$this->BLayout->updateTheme($name, $params, $this->name);
                }
            }
        }
    }
    
    strpos(haystack, needle, offset) {
      var i = (haystack + '')
        .indexOf(needle, (offset || 0));
      return i === -1 ? false : i;
    }
}

export default Core_Model_Module