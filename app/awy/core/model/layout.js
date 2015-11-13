class Core_Model_Layout extends Class {
	constructor() {
		super();
		// Default class name for newly created views
		this._defaultViewClass = false;
		// View objects registry
    	this.views = {};
        // Installed themes registry
        this._themes = {};
    	// Main (root) view to be rendered first
    	this._rootViewName = 'root';
        this.logger = Class.i('awy_core_model_logger', 'Layout');
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

	addView(viewName, params = {}, reset = false) {
        return Promise.all([
          Class.i('awy_core_model_view'), 
          this.logger
        ]).then(val => {
            let view = val[0];
            let logger = val[1];
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
                return view.factory(viewFile, params).then(v => {
                    this.views[viewAlias] = v;
                    //console.log(this.views[viewAlias]);
                    return Promise.resolve(this);
                });
            } else {
                this.views[viewAlias].setParam(params);
                return Promise.resolve(this);
            }
            
        }).catch(err => {

        });
        
        /*
        let viewAlias = params.view_alias || viewName;
        let viewFile = params.view_file || viewName;
        if (!(viewAlias in this.views) || ('view_class' in params)) {
            if (!('view_class' in params)) {
                if (this._defaultViewClass) {
                    params['view_class'] = this._defaultViewClass;
                }
            }
        
            this.Core_Model_View.then(view => {
                return view.factory(viewFile, params);
            }).then(v => {
                this.views[viewAlias] = v;
                console.log(this.views[viewAlias]);
            })
            
            

        } else {
            this.views[viewAlias].setParam(params);
        }

        return this;
        */
    }

    render(routeName = null, args = {}) {
        //$this->dispatch('render:before', $routeName, $args);

        //let rootView = this.rootView;
        //BDebug::debug('LAYOUT.RENDER ' . var_export(this.rootView, 1));
        if (!this.rootView) {
            //BDebug::error($this->BLocale->_('Main view not found: %s', $this->_rootViewName));
        }
        this.rootView.setParam('raw_text', 'BUG')
        //console.log(this.rootView.setParam('raw_text', 'BUG'));
        let result = this.rootView.render(args);

        //$args['output'] =& $result;
        //$this->dispatch('render:after', $routeName, $args);

        //$this->BSession->dirty(false); // disallow session change during layout render

        return result;
    }

    updateTheme(themeName, params, curModName = null){
        return this.addTheme(themeName, params, curModName);
    }

    addTheme(themeName, params, curModName = null) {
        return Class.i('awy_core_model_module_registry').then(modReg => {
            if (!curModName) {
                return modReg.currentModuleName();
            }
            return curModName;
        }).then(curModName => {
            console.log('Adding theme ' + themeName + ' from module ' + curModName);
            let paramsCopy = JSON.parse(JSON.stringify(params));
            //console.log(paramsCopy);
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
            //console.log(paramsCopy);
            if (!(themeName in this._themes)) {
                this._themes[themeName] = paramsCopy;
            } else {
                this._themes[themeName] = this.objectMerge(this._themes[themeName], paramsCopy);
            }
            return this._themes[themeName];
        });
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
}

export default Core_Model_Layout