class Awy_Core_Model_Layout extends Class {
	constructor() {
		super();
		// Default class name for newly created views
		this._defaultViewClass = false;
        // Default theme name (current area / main module)
        this._defaultTheme = false;
		// View objects registry
    	this.views = {};
        // Layouts declarations registry
        this._layouts = new Map();
        // Installed themes registry
        this._themes = {};
    	// Main (root) view to be rendered first
    	this._rootViewName = 'root';
        // Add view templates from these dirs after theme
        this._addViewsDirs = [];
        // Load these layout files after theme
        this._loadLayoutFiles = [];
        this._metaDirectives = {
            'remove': 'metaDirectiveRemoveCallback',
            'callback': 'metaDirectiveCallback',
            'include': 'metaDirectiveIncludeCallback',
            'root': 'metaDirectiveRootCallback',
            'hook': 'metaDirectiveHookCallback',
            'view': 'metaDirectiveViewCallback',
        };
        this.logger = Class.i('awy_core_model_logger', 'Layout');
	}

	set defaultViewClass(viewClass) {
        this._defaultViewClass = viewClass;
        return this;
    }

    get defaultViewClass(){
        return this._defaultViewClass;
    }

    set defaultTheme(theme) {
        this._defaultTheme = theme;
        return this;
    }

    get defaultTheme(){
        return this._defaultTheme;
    }

    set rootView(viewName) {
        this._rootViewName = viewName;
        return this;
    }

    get rootViewName() {
        return this._rootViewName;
    }

    get rootView() {
        return this._rootViewName ? this.view(this._rootViewName) : null;
    }

    collectAllViewsFiles(area = null) {
        if (null === area) {
            Class.i('awy_core_model_router_request').then(r => {
              area = r.area;
            });
        }
    }

    view(viewName) {
        return this.views[viewName] || null/*$this->BViewEmpty->i(true)->setParam('view_name', $viewName)*/;
    }

	async addView(viewName, params = {}, reset = false) {
        
        let view = await Class.i('awy_core_model_view');
        if (typeof params === 'string') {
            params = {view_class: params};
        }
        if (!('module_name' in params)) {
            let modReg = await Class.i('awy_core_model_module_registry');
            params['module_name'] = modReg.currentModuleName();
        }

        let viewAlias = params.view_alias || viewName;
        let viewFile = params.view_file || viewName;

        if (!(viewAlias in this.views) || ('view_class' in params)) {
            if (!('view_class' in params)) {
                if (this._defaultViewClass) {
                    params['view_class'] = this._defaultViewClass;
                }
            }
            let v = await view.factory(viewFile, params);
            this.views[viewAlias] = v;
                //console.log(this.views[viewAlias]);

        } else {
            this.views[viewAlias].setParam(params);
        }
        //console.log(this);
        
        return this;
    }

    async render(routeName = null, args = {}) {
        //$this->dispatch('render:before', $routeName, $args);

        let rootView = this.rootView;
        //console.log(rootView);
        (await this.logger).debug('LAYOUT.RENDER ');
        //(await this.logger).debug(rootView);
        if (!rootView) {
            (await this.logger).error('Main view not found: ' + this._rootViewName);
        }

        let result = await this.rootView.render();

        //$args['output'] =& $result;
        //$this->dispatch('render:after', $routeName, $args);

        //$this->BSession->dirty(false); // disallow session change during layout render

        return result;
    }

    updateTheme(themeName, params, curModName = null){
        return this.addTheme(themeName, params, curModName);
    }

    async addTheme(themeName, params, curModName = null) {
        let modReg = await Class.i('awy_core_model_module_registry');
        if (!curModName) {
            curModName = modReg.currentModuleName();
        }
        (await this.logger).debug('Adding theme ' + themeName + ' from module ' + curModName);
        let paramsCopy = JSON.parse(JSON.stringify(params));
        ['area', 'parent', 'layout_before', 'layout_after', 'views_before', 'views_after'].forEach(t =>{
            if (t in paramsCopy && t !== 'area' && t !== 'parent') {
                if (!Array.isArray(paramsCopy[t])) {
                    paramsCopy[t] = [paramsCopy[t]];
                } else {
                    paramsCopy[t] = paramsCopy[t];
                }
                paramsCopy[t].forEach( (v,i) => {
                    if (v[0] !== '@') {
                        paramsCopy[t][i] = '@' + curModName + '/' + v;
                    }
                });

            }
        });
        if (!(themeName in this._themes)) {
            this._themes[themeName] = paramsCopy;
        } else {
            this._themes[themeName] = this.objectMerge(this._themes[themeName], paramsCopy);
        }
        return this._themes[themeName];
    }

    async applyTheme(themeName = null) {
        if (null === themeName) {
            if (!this._defaultTheme) {
                throw new Error('Empty theme supplied and no default theme is set');
            }
            themeName = this._defaultTheme;
        }
        if (Array.isArray(themeName)) {
            let n;
            for (n of themeName) {
                this.applyTheme(n);
            }
            return this;
        }

        if (!(themeName in this._themes)) {
            throw new Error('Invalid theme supplied: ' + themeName);
            return this;
        }
        (await this.logger).debug('THEME.APPLY ' + themeName);
        let evnt = await Class.i('awy_core_model_events');
        evnt.fire('Layout::applyTheme:before', {'theme_name': themeName});

        await this.loadTheme(themeName);
        /*
        $this->loadLayoutFilesFromAllModules();

        $theme = $this->_themes[$themeName];
        $modReg = $this->BModuleRegistry;

        if (!empty($theme['views_after'])) {
             foreach ($theme['views_after'] as $viewsAfter) {
                $a = explode('/', $viewsAfter, 2);
                $viewsMod = $modReg->module(substr($a[0], 1));
                $viewsDir = $viewsMod->root_dir . '/' . $a[1];
                $this->addAllViews($viewsDir, '', $viewsMod);
            }
        }
        if (!empty($theme['layout_after'])) {
            foreach ($theme['layout_after'] as $layoutAfter) {
                $this->loadLayout($modReg->expandPath($layoutAfter));
            }
        }

        $this->BEvents->fire('BLayout::applyTheme:after', ['theme_name' => $themeName]);
        */
        return this;
    }

    async loadTheme(themeName){
        if (!(themeName in this._themes)) {
            throw new Error('Invalid theme name: ' + themeName);
            return false;
        }   

        let theme = this._themes[themeName];
        let req = await Class.i('awy_core_model_router_request');
        let area = req.area;
        // arrayize if present
        if ('area' in theme && !Array.isArray(theme.area)) {
            theme.area = [theme.area];
        }
        if ('area' in theme && !this.contains(theme.area, area)) {
            (await this.logger).debug('Theme ' + themeName + ' can not be used in ' + area);
            return false;
        }
        
        if ('parent' in theme) {
            let parentThemeName;
            if (!Array.isArray(theme.parent)) {
                theme.parent = [theme.parent];
            }
            for (parentThemeName of theme.parent) {
                let p = await this.loadTheme(parentThemeName);
                if (p) {
                    break; // load the first available parent theme
                }
            }
        }

        let evnt = await Class.i('awy_core_model_events');
        evnt.fire('Layout::loadTheme:before', {'theme_name': themeName, 'theme': theme});
        let modReg = await Class.i('awy_core_model_module_registry');
        /* not needed in JS
        if ('views_before' in theme) {
            let viewsBefore;
            for (viewsBefore of theme.views_before) {
                console.log(viewsBefore);
                $a = explode('/', $viewsBefore, 2);
                $viewsMod = $modReg->module(substr($a[0], 1));
                $viewsDir = $viewsMod->root_dir . '/' . $a[1];
                $this->addAllViews($viewsDir, '', $viewsMod);
            }
        }
        */
        
        if ('layout_before' in theme) {
            let layoutBefore;
            for (layoutBefore of theme.layout_before) {
                await this.loadLayout(modReg.expandPath(layoutBefore));
            }
        }
        /*
        if (!empty($theme['callback'])) {
            $this->BUtil->call($theme['callback']);
        }
        */
        evnt.fire('Layout::loadTheme:after', {'theme_name': themeName, 'theme': theme});
        return true;
    }

    /**
     * Add all view dirs and layouts declared in module manifest
     */
    async addModuleViewsDirsAndLayouts(module, area){
        let areaDir = area.replace('awy_', '');
        let moduleRootDir = module.root_dir;
        if (this.contains(module.auto_use,'all') || this.contains(module.auto_use,'views')) {
            await this.addAllViewsDir('/' + moduleRootDir + '/views');
            await this.addAllViewsDir('/' + moduleRootDir + '/' + areaDir + '/views');
        }
        if (this.contains(module.auto_use,'all') || this.contains(module.auto_use,'layout')) {
            this.loadLayoutAfterTheme('/' + moduleRootDir + '/layout.js');
            this.loadLayoutAfterTheme('/' + moduleRootDir + '/' + areaDir + '/layout.js');
        }
        return this;
    }  

    async addAllViewsDir(rootDir = null, prefix = '', curModule = null) {
        if (!curModule) {
            let modReg = await Class.i('awy_core_model_module_registry');
            curModule = modReg.currentModuleName();
        }
        this._addViewsDirs.push([rootDir, prefix, curModule]);
        return this;
    } 
    /**
     * Load layout update from file
     */
    async loadLayout(layoutFilename) {
        (await this.logger).debug('LAYOUT.LOAD: ' + layoutFilename);
        let layoutData = await System.import(layoutFilename);
        layoutData = layoutData.default;
        await this.addLayout(layoutData);
        return this;
    }

    /**
     * Load layout update after theme has been initialized
     */
    loadLayoutAfterTheme(layoutFilename, first = false) {
        if (first) {
            this._loadLayoutFiles.unshift(layoutFilename);
        } else {
            this._loadLayoutFiles.push(layoutFilename);
        }
        return this;
    }

    async addLayout(layoutName, layout = null) {
        if (typeof layoutName === "object") {
            let l;
            for (l in layoutName) {
                let def = layoutName[l];
                //console.log([l,def]);
                await this.addLayout(l, def);
            }

            return this;
        }
        
        if (!Array.isArray(layout)) {
            (await this.logger).debug('LAYOUT.ADD ' + layoutName + ': Invalid or empty layout');
        } else {
            if (!this._layouts.has(layoutName)) {
                (await this.logger).debug('LAYOUT.ADD ' + layoutName);
                this._layouts.set(layoutName, layout);
            } else {
                (await this.logger).debug('LAYOUT.UPDATE ' + layoutName);
                this.arrayMerge(this._layouts.get(layoutName), layout);
            }
        }
        return this;
    }

    async applyLayout(layoutName) {
        if (!this._layouts.has(layoutName)) {
            (await this.logger).debug('LAYOUT.EMPTY ' + layoutName);

            return this;
        }
        (await this.logger).debug('LAYOUT.APPLY ' + layoutName);
        //console.log(this._layouts.get(layoutName));
        // collect callbacks
        let callbacks = [];
        let d;
        for (d of this._layouts.get(layoutName)) {
            d['layout_name'] = layoutName;
            //console.log(d);
            if ('if' in d) {
                let r = d['if'].split('.');
                let clbClass = await Class.i(r[0]);
                let exists = await this.methodExists(clbClass, r[1]);
                if (!exists || !clbClass[r[1]]()) {
                    continue;
                }
            }
            
            if (!('type' in d)) {
                //console.log(Object.keys(this._metaDirectives));
                //console.log(Object.keys(d));
                let key = Object.keys(this._metaDirectives).find((element, index, array) => { 
                    return this.contains(Object.keys(d), element); 
                }, this);
                if (!(key in this._metaDirectives)){
                    throw new Error('Unknown layout directive: ');
                    continue;
                }
                d['type'] = key.trim();
                d['name'] = d[key].trim();
            }

            let callback = this._metaDirectives[d['type']];
            if (d['type'] === 'remove') {
                if (d['name'] === 'ALL') { //TODO: allow removing specific instructions
                    (await this.logger).debug('LAYOUT.REMOVE ALL');
                    callbacks = [];
                }
            } else {
                callbacks.push([callback, d]);
            }
        }
        // perform all callbacks
        let cb;
        for (cb of callbacks) {
            console.log(cb);
            await this[cb[0]](cb[1]);
        }

        return this;
    }
    /**
     * Register a view as call back to a hook
     * $viewName should either be a string with a name of view,
     * or an array in which first field is view name and the rest are view parameters.
     */
    async hookView(hookName, viewName, args = {}, params = {}) {
        if (Array.isArray(viewName)) {
            let viewParams = viewName;
            viewName = viewParams.shift();
            await this.addView(viewName, viewParams);
        }
        let view = this.view(viewName);
        if (!view) {
            (await this.logger).warn('Invalid view name: ' + viewName);
            return this;
        }
        if (!('alias' in params)) {
            params['alias'] = viewName;
        }
        await this.hook(hookName, view, args, params);
        return this;
    }
    /**
     * Register a call back to a hook
     */
    async hook(hookName, callback, args = {}, params = {}) {
        let evt = await Class.i('awy_core_model_events');
        //console.log(callback);
        await evt.on('Layout::hook:' + hookName, callback, args, params);

        return this;
    }

    async metaDirectiveIncludeCallback(args){
        if (args['name'] == args['layout_name']) { // simple 1 level recursion stop
            throw new Error('Layout recursion detected: ' + args['name']);
            return;
        }
        let layoutsApplied = [];
        if (args['name'] in layoutsApplied && !('repeat' in args)) {
            return;
        }
        layoutsApplied.push(args['name']);
        //console.log(layoutsApplied);
        await this.applyLayout(args['name']);
    }

    async metaDirectiveViewCallback(args) {
        //console.log(args);
    }

    async metaDirectiveHookCallback(args) {
        console.log(args);
        let hookArgs = args['args'] || {};
        /*
        if (!empty($d['position'])) {
            $args['position'] = $d['position'];
        }
        */
        let params = args['params'] || {};
        /*
        if (!empty($d['callbacks'])) {
            foreach ($d['callbacks'] as $cb) {
                $this->hook($d['name'], $cb, $args, $params);
            }
        }
        if (!empty($d['clear'])) {
            $this->hookClear($d['name'], $d['clear']);
        }
        */
        // process this as example layout directive
        // { hook: 'main', views: 'index' }
        if ('views' in args) {
            if (!Array.isArray(args.views)) {
                    args.views = [args.views];
            }
            let v;
            for (v of args.views) {
                if (v[0] === '^') {
                    //this.hookViewsRegex(args.name, '#'+v+'#', hookArgs, params);
                } else {
                    await this.hookView(args.name, v, hookArgs, params);
                }
            }
            if ('use_meta' in args) {
                //this.view(v).useMetaData();
            }
        }
        // process this as example layout directive
        // { hook: 'main', text: 'Blah Blah' }
        if ('text' in args) {
            if (!Array.isArray(args.text)) {
                    args.text = [args.text];
            }
            let t;
            let obj;
            for (t of args.text) {
                await this.hook(args.name, (obj) => obj.text || '', {text: t});
            }
        }

        return;
        
    }

    async metaDirectiveRootCallback(args){
        //console.log(args);
        /*
        $this->setRootView($d['name']);
        BDebug::debug('SET ROOT VIEW: ' . $d['name']);
        */
    }

    async metaDirectiveCallback(args) {
        //console.log(args);
        //$this->BUtil->call($d['name'], !empty($d['args']) ? $d['args'] : [], true);
    }

    async metaDirectiveRemoveCallback(args) {
        //console.log(args);
        //TODO: implement
    }

    objectMerge(...rest) {
      let base = rest.shift();
      for (let append of rest) {
        // base is not mergable, replace instead with last argument passed
        if (typeof base !== 'object') {
          return append;
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

    arrayMerge(...rest) {
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
        }
        return base;
    }

    contains(haystack, needle) {
        return !!~haystack.indexOf(needle);
    }

    foundInArray(element, index, array) {
        return this.contains(Object.keys(d), element);
    }

    async methodExists(obj, method) {
        try {
            let clbClass = obj;//await Class.i(obj);
            return typeof clbClass[method] === 'function';
        } catch(e) {
            return false;
        }
    }
}

export default Awy_Core_Model_Layout