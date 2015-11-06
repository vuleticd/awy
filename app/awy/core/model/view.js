class Core_Model_View extends Class {

	constructor(params) {
		super();
		this._params = params;
	}

	factory(viewName, params = {}) {
        params['view_name'] = viewName;

        let className = params.view_class || this.constructor.name;
        //console.log(className);
        //console.log(params);
        // !!!!!!!!!!!!!!!!!!!!!!!! import ISSUE HERE
       
        return ClassRegistry.getInstance(className, false, params).then(view => {
            return view;
        });

        //let view = ClassRegistry.getInstance(className, false, params);
        //console.log(view);
        //return view;
        
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

    _render() {
        let renderer = this.param('renderer');
        if (renderer) {
            //BDebug::debug('VIEW.RENDER "' . $this->param('view_name') . '" USING ' . print_r($renderer, 1));
            //return $this->BUtil->call($renderer, $this);
        }

        if (this.param('source')) {
            //BDebug::debug('VIEW.RENDER "' . $this->param('view_name') . '" RAW SOURCE');
            return this.param('source');
        }
/*
        BDebug::debug('VIEW.RENDER "' . $this->param('view_name') . '" USING PHP');
        ob_start();
        include $this->getTemplateFileName();
        return ob_get_clean();
*/
    }

    render(args = {}, retrieveMetaData = false) {
        let viewName = this.param('view_name');
        let modName = this.param('module_name');
        
        if (this.param('raw_text') !== null) {
            return this.param('raw_text');
        }
        
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

export default Core_Model_View