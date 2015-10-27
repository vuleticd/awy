export class Aobject {
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

export class ObjectRegistry extends Aobject {
    constructor() {
        super();
    }

    static getInstance(className, singleton = false, ...rest : any[]) {
        let key = [...rest, className.prototype.constructor.name].join('-');
        //console.log(_singletons);
        // if singleton is requested and already exists, return the singleton
        if (singleton && typeof _singletons[key] === 'object') {
            return _singletons[key];
        }

        let instance = Object.create(className.prototype);
        className.call(instance, ...rest);
        
        // if singleton is requested, save
        if (singleton) {
            _singletons[key] = instance;
        }

        return instance;
        
    }

    static overrideClass(className, newClassName, replaceSingleton = false) {
        //console.log('overrideClass');
    }
}

/*

USAGE

import {Aobject} from 'core/model/aobject';  // IMPORT/USE

import Router from 'core/model/router';  // INIT OBJECT

Router extends Aobject // .i() AVAIlABLE TO Router

Aobject.i(Router, ...rest: any[]);  // SINGLETON INSTANCE OF Router
Router.i(); //  SINGLETON INSTANCE OF Router extending Aobject

Router.i(true); // NEW INSTANCE OF Router extending Aobject

*/

//export default Aobject
