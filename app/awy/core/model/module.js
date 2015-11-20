// run_level
export const DISABLED  = 'DISABLED'; // Do not allow the module to be loaded
export const ONDEMAND  = 'ONDEMAND'; // Load this module only when required by another module
export const REQUESTED = 'REQUESTED'; // Attempt to load the module, and silently ignore, if dependencies are not met.
export const REQUIRED  = 'REQUIRED'; // Attempt to load the module, and fail, if dependencies are not met.

// run_status
export const IDLE    = 'IDLE'; // The module was found, but not loaded
export const PENDING = 'PENDING'; // The module is marked to be loaded, but not loaded yet. This status is currently used during internal bootstrap only.
export const LOADED  = 'LOADED'; // The module has been loaded successfully
export const ERROR   = 'ERROR'; // There was an error loading the module due to unmet dependencies

class Core_Model_Module extends Class {
	constructor(params: Object) {
		super();
		this._defaultRunLevel = ONDEMAND;
        this.root_dir = params.key;
        this.errors = [];
        this.areas = {};
        this.errors_propagated = false;
        this.parents = [];
        this.children = [];
        this.children_copy = [];
        this.logger = Class.i('awy_core_model_logger', 'Module');
        Class.i('awy_core_model_router_request').then(r => {
        	params['area'] = r.area;
        	this.set(params);
            this.processAreas(params);
            this.run_level = this._defaultRunLevel; // disallow declaring run_level in manifest
	        if (!('run_status' in this)) {
	            this.run_status = IDLE;
	        }

	        if (!('channel' in this)) {
	            this.channel = 'alpha';
	        }
        });
    }
    // Adding area specific module configurations
    processAreas() {
        if (this.area in this.areas) {
            let areaParams = this.areas[this.area];
            areaParams['update'] = true;
            this.update(areaParams);
        }
        return;
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

    update(params) {
        if (!('update' in params)) {
            console.log('Module is already registered: ' + this.module_name + ' with this manifest file ' + this.manifest_file );
            return this;
        }
        delete params['update'];
        let k;
        for (k in params) {
            if (k in this) {
                this[k] = this.objectMerge(this[k], params[k]);
            } else {
                this[k] =  params[k];
            }
        }
        return this;
    }

    doConf(config) {
        if ('default_config' in this) {
            console.log('Processing default_config for ' + this.module_name);
            for (let path in this.default_config) {
                if (this.strpos(path, '/') !== false) {
                    let value = this.default_config[path];
                    //console.log(value);
                    config.set(path, value);
                    delete this.default_config[path];
                }
                
            }
            config.add(this.default_config);
        }
    }
    /*
     * Fill global configuration from peaces contained in this module
     */
    async processDefaultConfig() {
        let config = await Class.i('awy_core_model_config');
        let layout = await Class.i('awy_core_model_layout');
        await this.doConf(config);
        await this.processThemes(layout);
        return this;
      
/*
        return Promise.all([
            Class.i('awy_core_model_config'), 
            Class.i('awy_core_model_layout'),
        ]).then(deps => {
            let config = deps[0];
            let layout = deps[1];
            if ('default_config' in this) {
                console.log('Processing default_config for ' + this.module_name);
                for (let path in this.default_config) {
                    if (this.strpos(path, '/') !== false) {
                        let value = this.default_config[path];
                        //console.log(value);
                        config.set(path, value);
                        delete this.default_config[path];
                    }
                    
                }
                config.add(this.default_config);
            }
            
            return layout;
        }).then(layout => {
            return this.processThemes(layout);
        }).then(() => {
            return Promise.resolve(this);
        });
*/
    }
    /*
     * loading theme configuration into layout
     */
    processThemes(layout) {
        let themes = JSON.parse(JSON.stringify(this.themes || {}));
        if (this.run_status !== PENDING || !('themes' in this)) {
            themes = {};
        } else {
            console.log('Processing theme configuration from ' + this.module_name);
        }

        return Promise.all(Object.keys(themes).map(themeName => {
            let params = themes[themeName];
            if ('name' in params && 'area' in params) {
                    params['module_name'] = this.module_name;
            }
            return layout.addTheme(themeName, params, this.module_name);
        })).then(l => {
            return Promise.resolve(this);
        });
    }

    // must return thenable
    onBeforeBootstrapCallback() {
        //console.log(this.module_name);
        if (this.run_status !== 'PENDING' || !('before_bootstrap' in this) || !('callback' in this.before_bootstrap)) {
            console.log('NO BeforeBootstrap Callback: ' + this.module_name);
            return Promise.resolve(false);
        }

        let className = this.before_bootstrap.callback.split(".")[0];
        let method = this.before_bootstrap.callback.split(".")[1];
    
        // CALLBACKS are all exeuted before this.bootstrap() but they don't follo wthe order of modules loading
        return Class.i(className).then(clbClass => {
            console.log('Executing BeforeBootstrap callback from ' + this.module_name);
            return Promise.resolve(clbClass[method]()).then(() => {
                return Promise.resolve(this);
            });
        });
        
    }

    prepareModuleEnvData() {
        if (!('url_prefix' in this)) {
            this['url_prefix'] = '';
        }
        if (!('view_root_dir' in this)) {
            this['view_root_dir'] = this.root_dir;
        }
        return this;
    }
    // must return thenable
    bootstrap() {
        console.log('Bootstrap module: ' + this.module_name);
        return Promise.resolve(7);
        /*
        if (this.run_status !== 'PENDING') {
            return Promise.resolve(this);
        }
        console.log('Bootstrap module: ' + this.module_name);
        return Promise.all([
            this.processViews(),
        ]).then(f => {
            this.run_status = 'LOADED';
            //console.log(this);
        });
        */
        /*
        $this->_processViews(); // before auto_use to initialize custom view classes
        $this->_processAutoUse();
        $this->_processRouting();
        $this->_processObserve();
        $this->_processSecurity();

        $this->BEvents->fire('BModule::bootstrap:before', ['module' => $this]);

        if (!empty($this->bootstrap)) {
            if (empty($this->bootstrap[0])) {
                $this->bootstrap = [$this->bootstrap];
            }
            foreach ($this->bootstrap as $bootstrap) {
                if (!empty($bootstrap['file'])) {
                    $includeFile = $this->BUtil->normalizePath($this->root_dir . '/' . $bootstrap['file']);
                    BDebug::debug('MODULE.BOOTSTRAP ' . $includeFile);
                    require_once($includeFile);
                }
                if (!empty($bootstrap['callback'])) {
                    $start = BDebug::debug($this->BLocale->_('Start bootstrap for %s', [$this->name]));
                    $this->BUtil->call($bootstrap['callback']);
                    #$mod->run_status = BModule::LOADED;
                    BDebug::profile($start);
                    BDebug::debug($this->BLocale->_('End bootstrap for %s', [$this->name]));
                }
            }
        }
        */
        

        return Promise.resolve(this);
    }

    processViews() {
        if (!('views' in this)) {
            return;
        }

        return Class.i('awy_core_model_layout').then(lay => {
            for (let v in this.views) {
                return lay.addView(v, this.views[v]);
            }
            //return Promise.resolve(this);
        });
        /*
        for (let v in this.views) {
            $viewName = strtolower($v[0]);
            $params = $v[1];
            $hlp->addView($viewName, $params);
        }
        */
    }
    // unknown number of promisses or simple executions
    processOverrides() {
        if (this.run_status !== 'PENDING') {
            console.log('NO processOverrides needed: ' + this.module_name);
            return Promise.resolve(false);
        }

        if ('override' in this && 'class' in this.override) {
            console.log('processOverrides: '  + this.module_name );

            let fncs = this.override['class'];
            let f = fncs.shift();
            fncs.reduce((cur, next, index) => {
                return cur.then(ClassRegistry.overrideClass(next[0], next[1]));
            }, Promise.resolve(ClassRegistry.overrideClass(f[0], f[1])));
            //console.log('sdsd');
        } else { 
            console.log('NO Overrides: '  + this.module_name );
            //return Promise.resolve(this);
        }

        return Promise.resolve(this);
/*
        if (!('before_bootstrap' in this) || !('callback' in this.before_bootstrap)) {
            return Promise.resolve(this);
        } else {
            let className = this.before_bootstrap.callback.split(".")[0];
            let method = this.before_bootstrap.callback.split(".")[1];
            console.log('sdsd');
            // Promise !!!!!
            //if (className && method) {
                return Promise.resolve(ClassRegistry.getInstance(className)).then(clbClass => {
                    console.log('Executing BeforeBootstrap callback from ' + this.module_name);
                    return Promise.resolve(43);
                });
            //}
            console.log('sdsd');
        }

        console.log('sdsd');
        */
    }
    
    strpos(haystack, needle, offset) {
      var i = (haystack + '')
        .indexOf(needle, (offset || 0));
      return i === -1 ? false : i;
    }

    /*
    * Merges any number of objects / parameters recursively
    */
    objectMerge(...rest) {
      let base = rest.shift();
      for (let append of rest) {
        // base is not mergable, replace instead with last argument passed
        if (typeof base !== 'object') {
          return append;
        }
        // both base and argument are arrays
        if (Array.isArray(append) && Array.isArray(base)) {
            for (let val of append) {
              if (this.contains(base, val)) {
                  base[base.indexOf(val)] = val;
                  append.splice(append.indexOf(val), 1);
              }
            }
            base.push(...append);
        }
        // both base and argument are objects
        let key;
        for (key in append) {
            if (key in base) {
              base[key] = this.objectMerge(base[key], append[key]);
            } else {
              Object.assign(base,append);
            }
        }
      }
      return base;
    }

    contains(haystack, needle) {
        return !!~haystack.indexOf(needle);
    }
}

export default Core_Model_Module