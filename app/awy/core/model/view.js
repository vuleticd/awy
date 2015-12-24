class Awy_Core_Model_View extends Class {

	constructor(params) {
		super();
		this._params = params || {};
        this.logger = Class.i('awy_core_model_logger', 'View');
        this.binders = {
            checked: function(node, propertyName, object) {
                console.log(this);
                node.addEventListener('change', () => {
                    object.updateObjectValue(propertyName, node.checked);
                    //onchange(node.checked);
                });
                return {
                    updateProperty: function(checked) {
                        if (checked !== node.checked) {
                            node.checked = checked;
                        }
                    },
                    observer: function(changes) {
                        let change;
                        for (change of changes){
                            if(change.name === propertyName){
                                if(change.object[change.name] !== node.checked){
                                    node.checked = change.object[change.name];
                                }
                            }
                        }
                    }
                };
            },
            value: function(node, propertyName, object) {
                node.addEventListener('keyup', () => {
                    object.updateObjectValue(propertyName, node.value);
                    //onchange(node.value);
                });
                return {
                    updateProperty: function(value) {
                        if (value !== node.value) {
                            node.value = value;
                        }
                    },
                    observer: function(changes) {
                        let change;
                        for (change of changes){
                            if(change.name === propertyName){
                                if(change.object[change.name] !== node.checked){
                                    node.checked = change.object[change.name];
                                }
                            }
                        }
                    }
                };
            },
            click: function(node, propertyName, object) {
                var previous;
                return {
                    updateProperty: function(fn) {
                        node.href = "javascript:void(0)";
                        //alert(object._origClass);
                        var listener = function(e) {
                            fn.apply(object, arguments);
                            e.preventDefault();
                        };
                        if (previous) {
                            node.removeEventListener(previous);
                            previous = listener;
                        }
                        node.addEventListener('click', listener);
                    },
                    observer: (changes) => false
                };
            }
        };
	}

    /* DATA BINDING */
    onlyDirectNested(container, selector) {
        let collection = container.querySelectorAll(selector);
        return Array.prototype.filter.call(collection, this['isDirectNested']);
    }

    isDirectNested(node) {
        node = node.parentElement;
        while (node) {
            if (node.dataset.repeat) {
                return false;
            }
            node = node.parentElement;
        }
        return true;
    }

    async bindModel(container) {
        let bindings = this.onlyDirectNested(container, '[data-bind]');
        let i;
        for (i in bindings){
            bindings[i] =  await this.bindObject(bindings[i]);
        }

        return {
            unobserve: () => {
                bindings.forEach((binding) => {
                    binding.unobserve();
                });
            }
        };
    }

    async bindObject(node) {
        let object = this;
        let parts = node.dataset.bind.split(' ');
        let propertyName = parts[1];
        let binderName = parts[0];
        // initiate template->object change
        let binder = this.binders[binderName](node, propertyName, this);
        // trigger object->template change
        binder.updateProperty(this[propertyName]);
        // listen for object->template changes
        Object.observe(this, binder['observer']);

        return {
            unobserve: function() {
                Object.unobserve(object, binder['observer']);
            }
        };
    }

    updateObjectValue(propertyName, v){
        this[propertyName] = v;
    }

    showStructure() {
        alert(JSON.stringify(this, null, 4));
    }

    getBodyClass() {
        alert(this.body_class.join(' '));
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

    get(name) {
        if (!('args' in this._params)) {
            return null;
        }
        return this._params['args'][name] || null;
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

    async _render(params){
        console.log('VIEW OBJECT');
        console.log(this);
        let parent;
        if ('parent' in params) {
            parent = params.parent;
        } else {
            parent = this.get('parent');
        }

        console.log(parent);
        let t = await this.getTemplateFileName();
        let doc = this.fragmentFromString(t);
        /*
        var tmp = document.createElement("div");
        tmp.appendChild(doc);
        console.log(tmp.innerHTML);
        */
        //console.log(doc);
        /*
        var nodeIterator = document.createNodeIterator(
          // Node to use as root
          doc,

          // Only consider nodes that are text nodes (nodeType 3)
          NodeFilter.SHOW_TEXT,

          // Object containing the function to use for the acceptNode method
          // of the NodeFilter
            { acceptNode: function(node) {
              // Logic to determine whether to accept, reject or skip node
              // In this case, only accept nodes that have content
              // other than whitespace
              if ( ! /^\s*$/.test(node.data) &&  /VIEW\{([^}\n]*)\}/.test(node.data) ) {
                return NodeFilter.FILTER_ACCEPT;
              }
            }
          },
          false
        );

        // Show the content of every non-empty text node that is a child of root
        var node;

        while ((node = nodeIterator.nextNode())) {
          alert(node.data);
          alert(node.parentElement);
        }


        var tmp = document.createElement("div");
        tmp.appendChild(doc);
        console.log(tmp.innerHTML); // <p>Test</p>
        //console.log(doc.outerHTML);
        */
        let bnd = await this.bindModel(doc);
        // STOP PROPAGATING object->template CHANGES FOR THIS FRAGMENT
        //bnd.unobserve();


        let collection = Array.from(doc.querySelectorAll('[data-hook]'));
        let node;
        for (node of collection){
            await this.hook(node.dataset.hook, {parent: node});
        }
        
        parent.appendChild(doc);
        /*
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
        */
        //let doc = this.fragmentFromString(t);
        //console.log(doc);
        //console.log(matches);
        //let ex = HTML.add.expand(t); // Creates unattached document fragment from emmet template
        return doc;
    }

    async hook(hookName, args = {}) {
        let result = '';//hookName + ' HOOK';
        (await this.logger).debug("START HOOK: " + hookName);
        let eventsInstance = await Class.i('awy_core_model_events'); 
        /*
        $result .= join('', $this->BEvents->fire('BView::hook:before', {'view': this, 'name': hookName}));
        */
        let hookRes = await eventsInstance.fire('Layout::hook:' + hookName, args);
        
        //console.log(args.parent);
        let doc;
        for(doc of hookRes) {
            args.parent.appendChild(doc);
        }
        //result +=  hookRes.join('');
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

    fragmentFromString(strHTML) {
        return document.createRange().createContextualFragment(strHTML);
    }

    async render(args = {}, retrieveMetaData = false) {
        let viewName = this.param('view_name');
        let modName = this.param('module_name');
        (await this.logger).debug('RENDER.VIEW @' + modName + '/' + viewName);
        if (this.param('raw_text') !== null) {
            return this.param('raw_text');
        }
        let viewContent = await this._render(args);
        //console.log(viewContent);

        //let parser = new DOMParser();
        //let doc = parser.parseFromString(viewContent, "text/html");
        //let doc = this.fragmentFromString(viewContent);
        //console.log(doc);
        // !! TRY TO BIND WITH OBJECT OBSERVE HERE !! https://curiosity-driven.org/object-observe-data-binding
        //this.withBinders(this.binders).bind(doc, this);

        //this.bindModel(doc);
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