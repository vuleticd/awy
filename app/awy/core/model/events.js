/**
 * Events and observers registry
 */
class Awy_Core_Model_Events extends Class {
    constructor() {
      super();
      this.logger = Class.i('awy_core_model_logger', 'Events'); 
      // Stores events and observers
      this._events = new Map();
    }
    /*
     * Declare event with default arguments in bootstrap function
     * This method is optional and currently not used.
     */
    declare(eventName, args = {}) {
        if (Array.isArray(eventName)) {
            let evnt;
            for (evnt of eventName) {
                this.declare(evnt[0], evnt[1] || {});
            }
            return $this;
        }
        eventName = eventName.toLowerCase();
        this._events.set(eventName, {'observers': [], 'args': args});
        return $this;
    }
    /*
     * Declare observers in bootstrap function
     * observe|watch|on|sub|subscribe ?
     * @param string || {} $params - alias, insert (function, 0=skip, -1=before, 1=after)
     */
    async on(eventName, callback = null, args = {}, params = null) {
        if (Array.isArray(eventName)) {
            let obs;
            for (obs of eventName) {
                this.on(obs[0], obs[1], obs[2] || {});
            }
            return this;
        }
        if (typeof params === 'string') {
            params = {'alias': params};
        }
        if (!('alias' in params) && typeof callback === 'string') {
            params['alias'] = callback;
        }
        let observer = {'callback': callback, 'args': args, 'alias': params['alias']};
        let modReg = await Class.i('awy_core_model_module_registry');
        observer['module_name'] = modReg.currentModuleName();
        eventName = eventName.toLowerCase();
        let inserted = false;
        if ('insert' in params) {
            /*
            $insertCallable = $this->BUtil->extCallback($params['insert']);
            $inserted = false;
            foreach ($this->_events[$eventName]['observers'] as $i => $obs) {
                if (!empty($insertCallable)) {
                    $result = $insertCallable($obs, $eventName, $callback);
                    if ($result) {
                        $beforeAfter = $result === -1 ? $i : ($i + 1);
                        array_splice($this->_events[$eventName]['observers'], $beforeAfter, 0, [$observer]);
                        $inserted = true;
                        break;
                    }
                }
            }
            if (!$inserted) {
                $this->_events[$eventName]['observers'][] = $observer;
            }
            */
        }

        if (!inserted) {
            if (!this._events.has(eventName)) {
                this._events.set(eventName, {'observers': []});
            }
            let e = this._events.get(eventName);
            if (!('observers' in e)) {
                e['observers'] = [];
            }
            e.observers.push(observer);
        }
        (await this.logger)('SUBSCRIBE ' + eventName);
        return this;
    }
    /*
     * Run callback on event only once, and remove automatically
     */
    async once(eventName, callback = null, args = {}, params = {}) {
        if (Array.isArray(eventName)) {
             let obs;
            for (obs of eventName) {
                await this.once(obs[0], obs[1], obs[2] || {});
            }
            return this;
        }
        await this.on(eventName, callback, args, params);
        let e = this._events.get(eventName);
        let lastId = e.observers.length;
        await this.on(eventName, (eventName, lastId) => {
            this.off(eventName, lastId - 1);// remove the observer
            this.off(eventName, lastId); // remove the remover
        });
        return this;
    }
    /*
     * Disable all observers for an event or a specific observer
     */
    off(eventName, alias = null) {
        eventName = eventName.toLowerCase();
        if (true === alias) { //TODO: null too?
            this._events.delete(eventName);
            return this;
        }
        let e = this._events.get(eventName);
        if (typeof alias === "number") {
            e.observers.splice(alias,1);
            return this;
        }
        e.observers.splice(e.observers.indexOf(alias),1);
        return this;
    }
    /*
     * Dispatch event observers
     * dispatch|fire|notify|pub|publish ?
     * @return Collection of results from observers
     */
    async fire(eventName, args = {}) {
        eventName = eventName.toLowerCase();
        (await this.logger).debug('FIRE ' + eventName);
        let result = [];
        let v = await ClassRegistry.getInstance('awy_core_model_view', false, {'module_name': 'awy_install','view_class': 'awy_core_model_view', 'view_name': 'index'});
        //let s1 = await ClassRegistry.getInstance('awy_core_view_root', false, {'module_name': 'awy_install','view_class': 'awy_core_model_view', 'view_name': 'step1'});
        this._events.set(eventName, {'observers': [
             {'callback': v, 'args': {}, 'alias': 'sdsdsd'},
             //{'callback': s1, 'args': {}, 'alias': 'sdsdsd'}
        ]});

        if (!this._events.has(eventName)) {
            return result;
        }

        let e = this._events.get(eventName);
        let observers = e.observers;
        let observer;
        for (observer of observers) {
            let i = observers.indexOf(observer);
            if ('args' in e) {
                args = this.objectMerge(e.args, args);
            }
            if ('args' in observer) {
                args = this.objectMerge(observer.args, args);
            }
            // Set current module to be used in observer callback
            if ('module_name' in observer) {
                let modReg = await Class.i('awy_core_model_module_registry');
                modReg.pushModule(observer['module_name']);
            }
            
            let cb = observer['callback'];
            console.log(cb);
            console.log(args);
            if (typeof cb === "object") {
                let exists = await this.methodExists(cb, 'set');
                if (exists) {
                    cb.set(args);
                }
                
                let s = await cb.__toString();
                result.push(s);
                continue;
            }

            /*
            // Special singleton syntax
            if (is_string($cb)) {
                foreach (['.', '->'] as $sep) {
                    $r = explode($sep, $cb);
                    if (sizeof($r) == 2) {
                        if (!class_exists($r[0]) && $this->BDebug->is('DEBUG')) {
                            echo "<pre>";
                            BDebug::cleanBacktrace();
                            echo "</pre>";
                        }
                        $cb                   = [$r[0]::i(), $r[1]];
                        $observer['callback'] = $cb;
                        // remember for next call, don't want to use &$observer
                        $observers[$i]['callback'] = $cb;
                        break;
                    }
                }
            }

            // Invoke observer
            if (is_callable($cb)) {
                BDebug::debug('ON ' . $eventName, 1);
                $result[] = $this->BUtil->call($cb, $args);
            } else {
                BDebug::warning('Invalid callback: ' . var_export($cb, 1), 1);
            }
            */

            if ('module_name' in observer) {
                modReg.popModule();
            }
        }
        console.log(result);
        return result;
    }

    observers(eventName) {
        return this._events.has(eventName) ? this._events.get(eventName) : {};
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

    async methodExists(obj, method) {
        try {
            let clbClass = obj;//await Class.i(obj);
            return typeof clbClass[method] === 'function';
        } catch(e) {
            return false;
        }
    }
}
export default Awy_Core_Model_Events;