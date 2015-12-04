class Core_Model_Layout extends Class {
	constructor() {
		super();
		// Default class name for newly created views
		this._defaultViewClass = false;
        // Default theme name (current area / main module)
        this._defaultTheme = false;
		// View objects registry
    	this.views = {};
        // Layouts declarations registry
        this._layouts = {};
        // Installed themes registry
        this._themes = {};
    	// Main (root) view to be rendered first
    	this._rootViewName = 'root';
        // Add view templates from these dirs after theme
        this._addViewsDirs = [];
        // Load these layout files after theme
        this._loadLayoutFiles = [];
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
        (await this.logger).debug(rootView);
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
                if (typeof paramsCopy[t] === 'string') {
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
        //$this->BEvents->fire('BLayout::applyTheme:before', ['theme_name' => $themeName]);

        this.loadTheme(themeName);
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

    loadTheme(themeName){
        if (!(themeName in this._themes)) {
            throw new Error('Invalid theme name: ' + themeName);
            return false;
        }   

        let theme = this._themes[themeName];
        /*
        $area = $this->BRequest->area();
        if (!empty($theme['area']) && !in_array($area, (array)$theme['area'])) {
            BDebug::debug('Theme ' . $themeName . ' can not be used in ' . $area);
            return false;
        }

        if (!empty($theme['parent'])) {
            foreach ((array)$theme['parent'] as $parentThemeName) {
                if ($this->loadTheme($parentThemeName)) {
                    break; // load the first available parent theme
                }
            }
        }

        $this->BEvents->fire('BLayout::loadTheme:before', ['theme_name' => $themeName, 'theme' => $theme]);

        $modReg = $this->BModuleRegistry;

        if (!empty($theme['views_before'])) {
            foreach ($theme['views_before'] as $viewsBefore) {
                $a = explode('/', $viewsBefore, 2);
                $viewsMod = $modReg->module(substr($a[0], 1));
                $viewsDir = $viewsMod->root_dir . '/' . $a[1];
                $this->addAllViews($viewsDir, '', $viewsMod);
            }
        }
        if (!empty($theme['layout_before'])) {
            foreach ($theme['layout_before'] as $layoutBefore) {
                $this->loadLayout($modReg->expandPath($layoutBefore));
            }
        }
        if (!empty($theme['callback'])) {
            $this->BUtil->call($theme['callback']);
        }

        $this->BEvents->fire('BLayout::loadTheme:after', ['theme_name' => $themeName, 'theme' => $theme]);
        */
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

    async applyLayout(layoutName) {
        if (!(layoutName in this._layouts)) {
            (await this.logger).debug('LAYOUT.EMPTY ' + layoutName);

            return this;
        }
        (await this.logger).debug('LAYOUT.APPLY ' + layoutName);
        /*
        // collect callbacks
        $callbacks = [];
        foreach ($this->_layouts[$layoutName] as $d) {
            $d['layout_name'] = $layoutName;
            if (!empty($d['if'])) {
                if (!$this->BUtil->call($d['if'], $d)) {
                    continue;
                }
            }
            if (empty($d['type'])) {
                if (!empty($d[0])) {
                    $d['type'] = $d[0];
                } else {
                    reset($d);
                    $d['type'] = key($d);
                    $d['name'] = current($d);
                    if (empty(static::$_metaDirectives[$d['type']])) {
                        BDebug::error('Unknown directive: ' . print_r($d, 1));
                        continue;
                    }
                }
                if (empty($d['type'])) {
                    BDebug::error('Unknown directive: ' . print_r($d, 1));
                    continue;
                }
            }
            $d['type'] = trim($d['type']);
            if (empty($d['type']) || empty(static::$_metaDirectives[$d['type']])) {
                BDebug::error('Unknown directive: ' . print_r($d, 1));
                continue;
            }
            if (empty($d['name']) && !empty($d[1])) {
                $d['name'] = $d[1];
            }
            $d['name'] = trim($d['name']);
            $d['layout_name'] = $layoutName;
            $callback = static::$_metaDirectives[$d['type']];

            if ($d['type'] === 'remove') {
                if ($d['name'] === 'ALL') { //TODO: allow removing specific instructions
                    BDebug::debug('LAYOUT.REMOVE ALL');
                    $callbacks = [];
                }
            } else {
                $callbacks[] = [$callback, $d];
            }
        }

        // perform all callbacks
        foreach ($callbacks as $cb) {
            $this->BUtil->call($cb[0], $cb[1]);
        }
        */
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
        evt.on('Layout::hook:' . hookName, callback, args, params);

        return this;
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

    contains(haystack, needle) {
        return !!~haystack.indexOf(needle);
    }
}

export default Core_Model_Layout