let instance = null;
let singletonEnforcer = {};

class Awy_Core_Model_Router extends Class {
    constructor(key: Object) {
        super();
        /*
        if (key !== singletonEnforcer) {
          throw new Error('You cannot instantiate "Router". Use the "getInstance" API instead.');
        }
        */
        this.logger = Class.i('awy_core_model_logger', 'Router');
        this.routes = [];
        this.mode = null;
        this.root = '/';
        this.current = null;
    }

    static getInstance(): Awy_Core_Model_Router {
        return instance || (instance = new Awy_Core_Model_Router(singletonEnforcer));
    }

    config(options): Awy_Core_Model_Router {
        this.mode = options && options.mode && options.mode == 'history' 
                    && !!(history.pushState) ? 'history' : 'hash';
        this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
        return this;
    }

    getFragment(): string {
        let fragment = '';
        if(this.mode === 'history') {
            fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            let match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return this.clearSlashes(fragment);
    }

    clearSlashes(path): string  {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }

    add(re, handler): Awy_Core_Model_Router {
        if(typeof re == 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re: re, handler: handler});
        return this;
    }

    remove(param): Awy_Core_Model_Router {
        for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                this.routes.splice(i, 1); 
                return this;
            }
        }
        return this;
    }

    flush(): Awy_Core_Model_Router {
        this.routes = [];
        this.mode = null;
        this.root = '/';
        return this;
    }

    async check(f): Awy_Core_Model_Router {
        //throw new Error('dsdsd');
        let fragment = f || this.getFragment();
        for(var i=0; i<this.routes.length; i++) {
            let escaperRoute = this.routes[i].re.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            let match = ("/"+fragment).match(new RegExp(escaperRoute));
            if(match && match[0] == "/"+fragment) {
                match.shift();
                //console.log(match);
                let className = this.routes[i].handler.split(".")[0];
                //console.log(className);
                let method = this.routes[i].handler.split(".")[1];
                let clbClass = await Class.i(className);
                //console.log(method);

                // Disable all observers for all (??Layout??) events, since this is equivalent to page refresh
                let evt = await Class.i('awy_core_model_events');
                evt.clear();

                let forward = await clbClass.dispatch(method, match);
                if (Array.isArray(forward)) {
                    let actionName = forward[0];
                    let controllerName = forward[1] || className;
                    let params = forward[2]
                    this.route('_ /forward', controllerName + '.' + actionName, {'params': params}, null, false);
                }

                //this.routes[i].handler.apply({}, match);
                return this;
            }           
        }
        return this;
    }

    listen(): Awy_Core_Model_Router {
        try{
            //this.current = this.getFragment();
            clearInterval(this.interval);
            this.interval = setInterval(this.loop.bind(this), 50);
            return this;
        } catch(e){
            //clearInterval(this.interval);
            throw e;
        }
    }

    loop(): void {
        //throw new Error('dsdsd');
        try{
            if(this.current !== this.getFragment()) {
                this.current = this.getFragment();
                this.check(this.current);
            } 
        } catch(e){
            throw e;
        }
    }

    async navigate(path): Awy_Core_Model_Router {
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    }
    // Declare route
    async route(route, callback = null, args = null, name = null, multiple = true) {
        if (Array.isArray(route)) {
            let a;
            for (r of route) {
                if (null === callback) {
                    this.route(a[0], a[1], (a[2] || null), (a[3] || null));
                } else {
                    this.route(a, callback, args, name, multiple);
                }
            }
            return this;
        }
        
        if (!('module_name' in args)) {
            let modReg = await Class.i('awy_core_model_module_registry');
            args['module_name'] = modReg.currentModuleName();
        }
        (await this.logger).debug('ROUTE ' + route);

        if (!this.contains(this.routes,route)) {
            this.routes.push({ re: route, handler: callback});
            //this.routes[$route] = new BRouteNode(['route_name' => $route]);
        }
        /*
        $this->_routes[$route]->observe($callback, $args, $multiple);

        if (null !== $name) {
            $this->_urlTemplates[$name] = $route;
        }
        */
        return this;
    }

    contains(haystack, needle) {
        return !!~haystack.indexOf(needle);
    }
}

/*

USAGE

this.router = Class.i(Awy_Core_Model_Router);  // INIT
this.router.then(router => {
    router.config({ mode: 'history'}); // CONFIGURE

    router.add(/about/, function() {...}) // ADD ROUTE AND HANDLER

    router.listen(); //  START ROUTER LISTENER 

    router.navigate(path);  // RUN TIME REDIRECTION 
});

*/

export default Awy_Core_Model_Router