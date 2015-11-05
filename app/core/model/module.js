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
		this._defaultRunLevel = 'REQUIRED';//'ONDEMAND';
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
            return Class.i('Core_Model_Config').then(cfgHlp => {
                for (let path in this.default_config) {
                    if (this.strpos(path, '/') !== false) {
                        let value = this.default_config[path];
                        //console.log(value);
                        cfgHlp.set(path, value);
                        delete this.default_config[path];
                    }
                    
                }
                cfgHlp.add(this.default_config);
                
                return this.processThemes();
            });
        }
        return this;
    }
    
    processThemes() {
        //TODO: automatically enable theme module when it is used
        if (this.run_status === 'PENDING' && 'themes' in this) {
            for (let name in this.themes) {
                let params = this.themes[name];
                if ('name' in params && 'area' in params) {
                    params['module_name'] = this.module_name;
                    return Class.i('Core_Model_Layout').then(lay => {
                        lay.addTheme(name, params, this.module_name);
                        return this;
                    });
                } else {
                    return Class.i('Core_Model_Layout').then(lay => {
                        lay.updateTheme(name, params, this.module_name);
                        return this;
                    });
                }
                
            }
        }
        return this;
    }

    onBeforeBootstrap() {
        //this.run_status = 'PENDING';
        
        if (this.run_status !== 'PENDING') {
            return this;
        }
        //this._prepareModuleEnvData();
        
        this.processOverrides();
        /*
        if (empty($this->before_bootstrap)) {
            return $this;
        }

        $bb = $this->before_bootstrap;
        if (!is_array($bb)) {
            $bb = ['callback' => $bb];
        }
        if (!empty($bb['file'])) {
            $includeFile = $this->BUtil->normalizePath($this->root_dir . '/' . $bb['file']);
            BDebug::debug('MODULE.BEFORE.BOOTSTRAP ' . $includeFile);
            require_once ($includeFile);
        }
        if (!empty($bb['callback'])) {
            $start = BDebug::debug($this->BLocale->_('Start BEFORE bootstrap for %s', [$this->name]));
            $this->BUtil->call($bb['callback']);
            #$mod->run_status = BModule::LOADED;
            BDebug::profile($start);
            BDebug::debug($this->BLocale->_('End BEFORE bootstrap for %s', [$this->name]));
        }
        */
        return this;
    }

    processOverrides() {
        if ('override' in this && 'class' in this.override) {
            for (let o of this.override['class']) {
                if (o.length !== 2) {
                    continue;
                }
                ClassRegistry.overrideClass(o[0], o[1]);
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