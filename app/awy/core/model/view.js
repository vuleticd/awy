class Awy_Core_Model_View extends Class {

	constructor(params) {
		super();
		this._params = params || {};
        this.logger = Class.i('awy_core_model_logger', 'View');
        this.binders = {
            click: function(node, onchange, object) {
                var previous;
                return {
                    updateProperty: function(fn) {
                        console.log(fn);
                        var listener = function(e) {
                            fn.apply(object, arguments);
                            e.preventDefault();
                        };
                        if (previous) {
                            node.removeEventListener(previous);
                            previous = listener;
                        }
                        node.addEventListener('click', listener);
                        //console.log(fn);
                    }
                };
            }
        };
	}

    async href(url = '') {
        let app = await Class.i('awy_core_model_app');
        return app.href(url);
    }

    /**
     * Factory to generate view instances
     */
	async factory(viewName, params = {}) {
        params['view_name'] = viewName;
        let className = params.view_class || this._origClass.toLowerCase();
        let view = await ClassRegistry.getInstance(className, false, params);
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
        if (!('args' in this._params)) {
            this._params['args'] = {};
        }

        if (typeof name === 'object') {
            let k;
            for (k in name) {
                this._params['args'][k] = name[k];
            }

            return this;
        }

        this._params['args'][name] = value;

        return this;
    }

    /**
     * Render as string=
     * If there's exception during render, output as string as well
     */
    async __toString() {
        let result = '';
        try {
            result = await this.render();
        } catch (e) {
            result = e;
        }

        return result;
    }

    get(name) {
        if (!('args' in this._params)) {
            return null;
        }
        return this._params['args'][name] || null;
    }
    /*
    html(strings, ...values){
        let raw = strings.raw;
        let result = '';

        values.forEach((subst, i) => {
            // Retrieve the literal section preceding
            // the current substitution
            let lit = raw[i];
            console.log(lit);
            // In the example, map() returns an array:
            // If substitution is an array (and not a string),
            // we turn it into a string
            if (Array.isArray(subst)) {
                subst = subst.join('');
            }
    
            // If the substitution is preceded by a dollar sign,
            // we escape special characters in it
            if (lit.endsWith('$')) {
                subst = htmlEscape(subst);
                lit = lit.slice(0, -1);
            }
            result += lit;
            result += subst;
        });
        console.log(raw);
        console.log(values);
        return 3;
    }
    */

    async _render(params){
        let t = await this.getTemplateFileName();
        // templates as template strings
        let matches = t.match(/VIEW\{([^}\n]*)\}/g);
        //console.log(matches);
        // templates as array of emmet commands joined and exported
        //let matches = t.match(/this.([^}\n ]*)/g);
        if (Array.isArray(matches)) {
            let m;
            for (m of matches) {
                let a = m.substring(5,m.length -1).replace('")','').split('("');
                //console.log(a);
                let r = null;
                switch(a.length){
                    case 2:
                        // calling function and wait for it
                        r =  await this[a[0]](a[1]);
                        break;
                    case 1:
                        // calling property
                        r = this[a[0]];
                        break;
                }
                //t.replace(/m/,r);
                t = t.replace(m,r);
            }
        }
        //console.log(matches);
        //let ex = HTML.add.expand(t); // Creates unattached document fragment from emmet template
        return t;
    }

    async hook(hookName, args = {}) {
        let result = '';//hookName + ' HOOK';
        (await this.logger).debug("START HOOK: " + hookName);
        let eventsInstance = await Class.i('awy_core_model_events'); 
        /*
        $result .= join('', $this->BEvents->fire('BView::hook:before', {'view': this, 'name': hookName}));
        */
        let hookRes = await eventsInstance.fire('Layout::hook:' + hookName, args);
        result +=  hookRes.join('');
        //result += eventsInstance.fire('Layout::hook:' + hookName, args).join('');
        /*
        $result .= join('', $this->BEvents->fire('BView::hook:after', ['view' => $this, 'name' => $hookName]));
        */
        (await this.logger).debug("END HOOK: " + hookName /*+ " WITH RESULT: " + result*/);
        return result;
    }

    async getTemplateFileName(fileExt = null, quiet = false) {
        if (null === fileExt) {
            fileExt = this.param('file_ext');
        }
        let template = this.param('template');
        let viewName = this.param('view_name');
        let modName = this.param('module_name');

        // if template is not set get the template from modules view dir
        if (!template && viewName) {
            let modReg = await Class.i('awy_core_model_module_registry');
            template = modReg._modules.get(modName).view_root_dir + '/views/' + viewName;
        }
        (await this.logger).debug('TEMPLATE ' + template + '.js');
        template = await System.import(template + '.js');
        template = template.default;
        /*
        if (template) {
            if (!$this->BUtil->isPathAbsolute($template)) {
                $template = $this->BLayout->getViewRootDir() . '/' . $template;
            }
            if (!is_readable($template) && !$quiet) {
                BDebug::notice('TEMPLATE NOT FOUND: ' . $template);
            } else {
                (await this.logger).debug('TEMPLATE ' . $template);
            }
        }
        */
        //(await this.logger).debug('TEMPLATE ' + template);
        return template;
    }

    bindModel(container) {
        let bi = container.querySelectorAll('[data-bind]');
        let bi_array = Array.from(bi); 
        let bindings = bi_array.map((node) => {
            let parts = node.dataset.bind.split(' ');
            return this.bindObject(node, parts[0], parts[1]);
        });
        //console.log(bindings);
        return {
            unobserve: function() {
                bindings.forEach(function(binding) {
                    binding.unobserve();
                });
            }
        };
    }

    showStructure() {
        alert('sdsdsdsd');
        //alert(JSON.stringify(this, null, 4));
    }

    bindObject(node, binderName, propertyName) {
        
        var updateValue = function(newValue) {
            this[propertyName] = newValue;
        };
        var binder = this.binders[binderName](node, updateValue, this);
        binder.updateProperty(this[propertyName]);
        var observer = function(changes) {
            var changed = changes.some(function(change) {
                return change.name === propertyName;
            });
            if (changed) {
                binder.updateProperty(this[propertyName]);
            }
        };
        Object.observe(this, observer);
        return {
            unobserve: function() {
                Object.unobserve(this, observer);
            }
        };
    }

    async render(args = {}, retrieveMetaData = false) {
        let viewName = this.param('view_name');
        let modName = this.param('module_name');
        (await this.logger).debug('RENDER.VIEW @' + modName + '/' + viewName);
        if (this.param('raw_text') !== null) {
            return this.param('raw_text');
        }

        let viewContent = await this._render();
        //console.log(viewContent);
        let parser = new DOMParser();
        let doc = parser.parseFromString(viewContent, "text/html");
        //console.log(doc);
        // !! TRY TO BIND WITH OBJECT OBSERVE HERE !! https://curiosity-driven.org/object-observe-data-binding
        this.bindModel(doc);
        return viewContent;
        /*
        foreach ($args as $k => $v) {
            $this->_params['args'][$k] = $v;
        }
        if ($modName) {
            //$this->BModuleRegistry->pushModule($modName);
        }
        $result = '';
        if (!$this->_beforeRender()) {
            BDebug::debug('BEFORE.RENDER failed');
            if ($debug) {
                $result .= "<!-- FAILED VIEW: {$viewName} -->\n";
            }
            if ($modName) {
                //$this->BModuleRegistry->popModule();
            }
            return $result;
        }

        $showDebugTags = $debug && $modName && $viewName && $this->BLayout->getRootViewName() !== $viewName;

        if ($showDebugTags) {
            $result .= "<!-- START VIEW: @{$modName}/{$viewName} -->\n";
        }

        // TODO: link views with layouts
        $this->BLayout->viewStackOn($this);

        $result .= join('', $this->BEvents->fire('BView::render:before', ['view' => $this]));

        $viewContent = $this->_render();

        if ($retrieveMetaData) {
            // collect meta data and remove meta tags from source
            $viewContent = $this->collectMetaData($viewContent);
        }

        $result .= $viewContent;
        $result .= join('', $this->BEvents->fire('BView::render:after', ['view' => $this]));

        $this->BLayout->viewStackOff($this);

        if ($showDebugTags) {
            $result .= "<!-- END VIEW: @{$modName}/{$viewName} -->\n";
        }
        BDebug::profile($timer);

        $this->_afterRender();
        if ($modName) {
            //$this->BModuleRegistry->popModule();
        }

        return $result;
        */
    }

    param(key = null) {
        if (null === key) {
            return this._params;
        }

        return this._params[key] || null;
    }
}

export default Awy_Core_Model_View