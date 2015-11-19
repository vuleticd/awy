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

    check(f): Awy_Core_Model_Router {
        var fragment = f || this.getFragment();
        for(var i=0; i<this.routes.length; i++) {
            var match = fragment.match(this.routes[i].re);
            if(match) {
                match.shift();
                this.routes[i].handler.apply({}, match);
                return this;
            }           
        }
        return this;
    }

    listen(): Awy_Core_Model_Router {
        //this.current = this.getFragment();
        clearInterval(this.interval);
        this.interval = setInterval(this.loop.bind(this), 50);
        return this;
    }

    loop(): void {
       if(this.current !== this.getFragment()) {
            this.current = this.getFragment();
            this.check(this.current);
        } 
    }

    navigate(path): Awy_Core_Model_Router {
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
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