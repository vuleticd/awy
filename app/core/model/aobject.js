class Aobject {
    /**
     * get singleton of TestClass which extends the Object | TestClass::i();
     * get singleton of $obj | Aobject.i($obj);
     * create new instance of TestClass which extends the Object | TestClass::i(true);
     */
    static i(newInst = false, ...rest : any[]) {
        let className = '';
        if (typeof newInst.prototype === "object") {
            className = newInst;
            newInst = false;
        } else {
            className = this;
        }

        return ObjectRegistry.getInstance(className, !newInst, ...rest);
    }
}

let _instance = null;
let _singletons = {};
let _classes = [];

class ObjectRegistry extends Aobject {
    constructor() {
        super();
    }

    static getInstance(className, singleton = false, ...rest : any[]) {
        // if singleton is requested and already exists, return the singleton
        if (singleton && typeof _singletons[className.prototype.constructor.name] === 'object') {
            return _singletons[className.prototype.constructor.name];
        }
        /*
        if (!class_exists($className, true)) {
            Debug::error('Invalid class name: %s', $className);
        }
        */
        let instance = Object.create(className.prototype);
        className.call(instance, ...rest);
        
        // if singleton is requested, save
        if (singleton) {
            _singletons[className.prototype.constructor.name] = instance;
        }

        return instance;
        
    }
}

/*

USAGE

import Aobject from 'core/model/aobject';  // IMPORT/USE

import Router from 'core/model/router';  // INIT OBJECT

Router extends Aobject // .i() AVAIlABLE TO Router

Aobject.i(Router, ...rest: any[]);  // SINGLETON INSTANCE OF Router
Router.i(); //  SINGLETON INSTANCE OF Router extending Aobject

Router.i(true); // NEW INSTANCE OF Router extending Aobject

*/

export default Aobject
