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

    /*
     * Fill global configuration from peaces contained in this module
     */
    async processDefaultConfig() {
        let config = await Class.i('awy_core_model_config');
        let layout = await Class.i('awy_core_model_layout');
        if ('default_config' in this) {
            (await this.logger).debug('Processing default_config for ' + this.module_name);
            for (let path in this.default_config) {
                if (this.strpos(path, '/') !== false) {
                    let value = this.default_config[path];
                    config.set(path, value);
                    delete this.default_config[path];
                }
                
            }
            config.add(this.default_config);
        }
        await this.processThemes(layout);
        return this;
    }
    /*
     * loading theme configuration into layout
     */
    async processThemes(layout) {
        let themes = JSON.parse(JSON.stringify(this.themes || {}));
        if (this.run_status !== PENDING || !Object.keys(themes).length) {
            return false;
        }
        (await this.logger).debug('Processing theme configuration from ' + this.module_name);
        // async without concurncy
        let themeKeys = Object.keys(themes);
        let promises = themeKeys.map(themeName => {
            let params = themes[themeName];
            if ('name' in params && 'area' in params) {
                    params['module_name'] = this.module_name;
            }
            return layout.addTheme(themeName, params, this.module_name);
        });

        let loadedThemes = await Promise.all(promises);
        return loadedThemes;
    }
    
    async onBeforeBootstrap(){
        if (this.run_status !== PENDING) {
            // skip BeforeBootstrap for this module
            return;
        }
        this.prepareModuleEnvData();
        await this.processOverrides();

        if (!('before_bootstrap' in this) || !('callback' in this.before_bootstrap)) {
            //(await this.logger).debug('NO BeforeBootstrap Callback: ' + this.module_name);
            return;
        }

        let className = this.before_bootstrap.callback.split(".")[0];
        let method = this.before_bootstrap.callback.split(".")[1];
        (await this.logger).debug('Start BEFORE bootstrap callback for ' + this.module_name);
        let clbClass = await Class.i(className);
        await clbClass[method]();
        (await this.logger).debug('End BEFORE bootstrap callback for ' + this.module_name);
        return;
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

    async processOverrides() {
        if ('override' in this && 'class' in this.override) {
            let override;
            for (override of this.override['class']) {
                (await this.logger).debug('OVERRIDE CLASS: ' + override[0] + ' -> ' + override[1] + ' @ ' + this.module_name );
                await ClassRegistry.overrideClass(override[0], override[1]);
            }
        }

        return this;
    }

    async onBootstrap() {
        if (this.run_status !== PENDING) {
            //console.log('skip Bootstrap for: ' + this.module_name);
            // skip Bootstrap for this module
            return;
        }
        //(await this.logger).debug('Bootstrap module: ' + this.module_name);
        
        this.processAutoload();
        this.processTranslations();
        await this.processViews(); // before auto_use to initialize custom view classes
        await this.processAutoUse();
        await this.processRouting();
        await this.processObserve();
        /*
        $this->_processSecurity();
        */
        
        if ('bootstrap' in this) {
            (await this.logger).debug('Start bootstrap callback for ' + this.module_name);
            let b;
            for (b of this.bootstrap) {
                if ('callback' in b) {
                    let className = b.callback.split(".")[0];
                    let method = b.callback.split(".")[1];
                    let clbClass = await Class.i(className);
                    await clbClass[method]();
                }
            }
            (await this.logger).debug('End bootstrap callback for ' + this.module_name);
        }
        
        //console.log(this);
        this.run_status = LOADED;
        return this;
    }
    /*
     * ToDo, Not working yet
     */
    processAutoload() {
        if ('autoload' in this) {
            let al;
            for (al of this.autoload) {
                //System.paths[al[0]] = '/app/' + this.root_dir + "/" + al[1] + '/*.js';
                //System.import('test/trtrttr');
            }
        }
    }
    /*
     * ToDo, Not working yet
     */
    processTranslations() {
        //let language = $this->BSession->get('current_language');
        if (/*language && */'translations' in this) {
            let tr = this.translations[/*language*/'en'];
            let file = '/app/' + this.root_dir + "/i18n/" + tr;
            //let locale = await Class.i('awy_code_model_locale');
            //await locale.addTranslationsFile(file);
            //console.log(file);
        }
    }

    // sync but probably should be async and not concurent
    async processViews() {
        if (!('views' in this)) {
            return;
        }
        let layout = await Class.i('awy_core_model_layout');
        for (let v in this.views) {
            await layout.addView(v, this.views[v]);
            (await this.logger).debug('ADD VIEW: ' + v + ' -> ' + this.views[v]['view_class'] + ' @ ' + this.module_name );
        }
    }

    async processAutoUse() {
        if (!('auto_use' in this)) {
            return;
        }
        // array_flip -> Map
        let req = await Class.i('awy_core_model_router_request');
        let util = await Class.i('awy_core_util_misc');
        let area = req.area;
        let areaDir = area.replace('awy_', '');
        if (util.contains(this.auto_use,'all') || util.contains(this.auto_use,'bootstrap')) {
            if (!('bootstrap' in this)) {
                this['bootstrap'] = [];
            }
            let mainExist = await this.methodExists(this.module_name + '_main', 'bootstrap');
            if (mainExist) {
                this.bootstrap.push({ callback: this.module_name + '_main.bootstrap'});
            }
            let areaExist = await this.methodExists(this.module_name + '_' + areaDir, 'bootstrap');
            if (areaExist) {
                this.bootstrap.push({ callback: this.module_name + '_' + areaDir + '.bootstrap'});
            }
        }

        let layout = await Class.i('awy_core_model_layout');
        layout.addModuleViewsDirsAndLayouts(this, area);
        //console.log(layout);
    }

    async processRouting(){
        if (!('routing' in this)) {
            return;
        }
        
        let hlp = await Class.i('awy_core_model_router');
        let r;
        let method; 
        let route; 
        let callback; 
        let args; 
        let name; 
        let multiple;
        
        for(r of this.routing){
            if (r[0][0] === '/' || r[0][0] === '^') {
                method = 'route';
                route = r[0];
                callback = r[1];
                args = r[2] || {};
                name = r[3] || null;
                multiple = r[4] || true;
            } else {
                 method = r[0].toLowerCase();
                 /*
                 if (!isset($r[1])) {
                    BDebug::error('Invalid routing directive: ' . print_r($r));
                    continue;
                }*/
                route = r[1];
                callback = r[2] || null;
                args = r[3] || {};
                name = r[4] || null;
                multiple = r[5] || true;

            }
            await hlp[method](route, callback, args, name, multiple);
        }
        //console.log(hlp);
    }

    async processObserve() {
        if (!('observe' in this)) {
            return;
        }
        let hlp = await Class.i('awy_core_model_events');
        let o;
        for (o of this.observe) {
            let evnt = o[0];
            let callback = o[1];
            let args = o[2] || {};
            await hlp.on(evnt, callback, args);
        }
    }

    async methodExists(obj, method) {
        try {
            let clbClass = await Class.i(obj);
            return typeof clbClass[method] === 'function';
        } catch(e) {
            return false;
        }
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
              if (!!~base.indexOf(val)) {
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
}

export default Core_Model_Module