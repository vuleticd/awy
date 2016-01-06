class Awy_Core_Controller_Abstract extends Class {
	constructor() {
		super();
		// Current action name
   		this._action;
    	//Forward location. If set the dispatch will loop and forward to next action
    	this._forward;
    	//Prefix for action methods
		this._actionMethodPrefix = 'action_';
	}

	/**
     * Shortcut for fetching layout views
     */
    async view(viewname) {
    	let layout = await Class.i('awy_core_model_layout');
    	let v = layout.view(viewname);
        return v;
    }

    /**
     * Apply current area theme and layouts supplied as parameter
     */
    async layout(name = null) {
    	let config = await Class.i('awy_core_model_config');
        let layout = await Class.i('awy_core_model_layout');
        let req = await Class.i('awy_core_model_router_request');
        let theme = config.get('modules/' + req.area + '/theme');
        if(!theme){
			theme = layout.defaultTheme;
        }
        if (theme) {
            await layout.applyTheme(theme);
        }
        if (name) {
        	if (!Array.isArray(name)) {
        		name = [name];
        	}
        	let l;
            for (l of name) {
                await layout.applyLayout(l);
            }
        }
        return this;
    }

    /**
     * Dispatch action within the action controller class
     */
    async dispatch(actionName, args = {}) {
        this._action = actionName;
        this._forward = null;
        let before = await this.onBeforeDispatch(args);
        if (!before) {
            return false;
        }
        if (null !== this._forward) {
            return this._forward;
        }

        let authenticated = true;
        if (actionName !== 'unauthenticated') {
             authenticated = this.authenticate(args);
             if (!authenticated) {
                 this.forward('unauthenticated');
                 return this._forward;
             }

             if (actionName !== 'unauthorized' && !this.authorize(args)) {
                 this.forward('unauthorized');
                 return this._forward;
             }
        }

        await this.tryDispatch(actionName, args);

        if (null === this._forward /*&& !$this->BRouting->isStopped()*/) {
             await this.onAfterDispatch(args);
        }
        return this._forward;
    }

    /**
     * Try to dispatch action and catch exception if any
     */
    async tryDispatch(actionName, args){
    	/*
        if (!is_string($actionName) && is_callable($actionName)) {
            try {
                call_user_func($actionName);
            } catch (Exception $e) {
                $this->BDebug->exceptionHandler($e);
                $this->sendError($e->getMessage());
            }
            return $this;
        }
        */
        let actionMethod = this._actionMethodPrefix + actionName;
        /*
        $reqMethod = !empty($args['method']) ? $args['method'] : $this->BRequest->method();
        if ($reqMethod !== 'GET') {
            $tmpMethod = $actionMethod . '__' . $reqMethod;
            if (method_exists($this, $tmpMethod)) {
                $actionMethod = $tmpMethod;
            } elseif ($this->BRouting->currentRoute()->multi_method) {
                $this->forward(false); // If route has multiple methods, require method suffix
                return $this;
            }
        }
        */
        //echo $actionMethod;exit;

        //console.log(actionMethod in this);
        
        if (!(actionMethod in this)) {
            this.forward(false);
            return this;
        }
        /*
        $this->BRequest->stripRequestFieldsTags();
		*/

        await this[actionMethod](args);

        return this;
    }

    async onAfterDispatch() {
    	console.log('Awy_Core_Controller_Abstract.onAfterDispatch');
    	let response = await Class.i('awy_core_model_router_response');
        await response.output();
/*
        $this->BEvents->fire(__METHOD__); // general onAfterDispatch event for all controller
        $className = static::$_origClass ? static::$_origClass : get_class($this);
        $args = ['action' => $this->_action, 'controller' => $this];
        $this->BEvents->fire($className . '::onAfterDispatch', $args); // specific controller instance
*/    
    }

    /*
     * Execute before dispatch and return resutl
     * If false, do not dispatch action, and either forward or default
     */
    async onBeforeDispatch(){
    	console.log('Awy_Core_Controller_Abstract.onBeforeDispatch');
        //$className = static::$_origClass ? static::$_origClass : get_class($this);
        let args = {'action': this._action, 'controller': this};
        //$this->BEvents->fire($className . '::onBeforeDispatch', $args); // specific controller instance
        return true;
    }

    /**
     * Authenticate logic for current action controller, based on arguments
     */
    authenticate(args = {}) {
        return true;
    }

     /**
     * Authorize logic for current action controller, based on arguments
     */
    authorize(args = {}) {
        return true;
    }

    /**
    * Forward to another action or retrieve current forward
    */
    forward(actionName = null, controllerName = null, params = {}) {
        if (false === actionName) {
            this._forward = false;
        } else {
            this._forward = [actionName, controllerName, params];
        }
        return this;
    }
}

export default Awy_Core_Controller_Abstract