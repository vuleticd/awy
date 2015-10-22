import Logger from 'core/model/logger';

let instance = null;
let singletonEnforcer = {};

class Router {
    constructor(key: Object) {
        if (key !== singletonEnforcer) {
          throw new Error('You cannot instantiate "Router". Use the "getInstance" API instead.');
        }
        this.logger = Logger.getInstance('Router');
        this.routes = [];
        this.mode = null;
        this.root = '/';
        this.current = null;
    }

    static getInstance(): Router {
        return instance || (instance = new Router(singletonEnforcer));
    }

    config(options): Router {
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

    add(re, handler): Router {
        if(typeof re == 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re: re, handler: handler});
        return this;
    }

    remove(param): Router {
        for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                this.routes.splice(i, 1); 
                return this;
            }
        }
        return this;
    }

    flush(): Router {
        this.routes = [];
        this.mode = null;
        this.root = '/';
        return this;
    }

    check(f): Router {
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

    listen(): Router {
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

    navigate(path): Router {
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

import Router from 'core/model/router';  // IMPORT/USE

this.router = Router.getInstance();  // INIT

this.router.config({ mode: 'history'}); // CONFIGURE

this.router.add(/about/, function() {...}) // ADD ROUTE AND HANDLER

this.router.listen(); //  START ROUTER LISTENER 

this.router.navigate(path);  // RUN TIME REDIRECTION

*/

export default Router