var handler = {
    get: function(target, name, receiver){
        if (name[0] < 'A' || name[0] > 'Z') {
            //console.info("Invalid class name " + name);
            return;
        }

        if (name in receiver._diLocal) {
            return receiver._diLocal[name];
        }

        if (name in diGlobal) {
            //console.log('from diGlobal');
            return diGlobal[name];
        }
        return receiver.getGlobalDependencyInstance(name, receiver);
    }
};

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function Proto() { }
Proto.prototype = new Proxy({}, handler);

let diGlobal = {};

export class Aobject extends Proto {
    constructor() {
        super();
        this._origClass = this.constructor.name;
        this._diConfig = {
            '*': 'ALL',
        };
        this._diLocal = {};
    }
    /**
     * get singleton of TestClass which extends the Object | TestClass::i();
     * get singleton of $obj | Aobject.i($obj);
     * create new instance of TestClass which extends the Object | TestClass::i(true);
     */
    static i(newInst = false, ...rest : any[]) {
        let className = '';
        if (typeof newInst === "string" && newInst[0] > 'A' && newInst[0] < 'Z') {
            className = newInst;
            newInst = false;
        } else {
            className = this;
        }
        return ObjectRegistry.getInstance(className, !newInst, ...rest);
    }

    getGlobalDependencyInstance(name, receiver) {
        return new Promise(function(resolve, reject) {
            //console.info(receiver._origClass);
            let className = false;
            if (name in receiver._diConfig) {
                if (typeof receiver._diConfig[name] === 'object' && !Array.isArray(receiver._diConfig[name])) {
                     reject("Invalid class type in DI Configuration!!");
                }
                if (Array.isArray(receiver._diConfig[name])) {
                    className = receiver._diConfig[name][0];
                } else {
                    className = receiver._diConfig[name];
                }
            } else {
                className = name;
                if (!('*' in receiver._diConfig)) {
                    reject("Class is not allowed by DI " + className);
                }
            }

            ObjectRegistry.getInstance(className, true).then(inst => {
                //console.log(inst);
                diGlobal[className] = inst;
                resolve(diGlobal[className]);
            }, error => {
                //console.log('error');
                reject(error);
            });
        });
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
        return new Promise(function(resolve, reject) {
            //console.info(className);
            //console.info(singleton);
            let key = [...rest, className].join('-');
            //console.info(key);
            //console.info(_singletons);
            if (singleton && typeof _singletons[key] === 'object') {
                resolve(_singletons[key]);
            }

            let path = replaceAll(String(className).toLowerCase(), "_", '/');
            System.import(path).then(file => {
                let instance = Object.create(file.default.prototype);
                file.default.call(instance, ...rest);
                //console.log(instance);
                if (singleton) {
                    _singletons[key] = instance;
                }
                resolve(instance);
            }, error => {
                reject(error);
            });
        });
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
