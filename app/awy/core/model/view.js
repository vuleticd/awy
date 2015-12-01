class Awy_Core_Model_View extends Class {

	constructor(params) {
		super();
		this._params = params;
        this.logger = Class.i('awy_core_model_logger', 'View');
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
        if (typeof name === 'object') {
            for (k in name) {
                this._params['args'][k] = name[k];
            }

            return this;
        }
        if (!('args' in this._params)) {
        	this._params['args'] = {};
        }
        this._params['args'][name] = value;

        return this;
    }

    get(name) {
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
        //let m = t.match(/\$(\S*)/g).map(s => `${this.get(s.replace("$",''))}`);
        let m = t.replace(/\$(\S*)/g, s => `${this.get(s.replace("$",''))}`);
        console.log(m);
        return m;
    }

    async getTemplateFileName(fileExt = null, quiet = false) {
        if (null === fileExt) {
            fileExt = this.param('file_ext');
        }
        let template = this.param('template');
        let viewName = this.param('view_name');
        if (!template && viewName) {
            template = viewName + fileExt;
        }
        template = await System.import(template);
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
        (await this.logger).debug('TEMPLATE ' + template);
        return template;
    }

    async render(args = {}, retrieveMetaData = false) {
        let viewName = this.param('view_name');
        let modName = this.param('module_name');
        (await this.logger).debug('RENDER.VIEW @' + modName + '/' + viewName);
        if (this.param('raw_text') !== null) {
            return this.param('raw_text');
        }

        let viewContent = await this._render();

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