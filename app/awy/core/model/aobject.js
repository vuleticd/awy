/*
var handler = {
    
    get: function(target, name, receiver){
        if (target[name] !== 'undefined') {return;}
        //if (name[0] < 'A' || name[0] > 'Z') {
            //console.info("Invalid class name " + name);
            //return;
        //}

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
*/
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
/*
function Proto() { }
Proto.prototype = new Proxy({}, handler);
*/
let diGlobal = {};

export class Aobject{
    constructor() {
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
        if (typeof newInst === "string") {
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
let _classes = {};

export class ObjectRegistry extends Aobject {
    constructor() {
        super();
    }

    static getInstance(className, singleton = false, ...rest : any[]) {
        return new Promise(function(resolve, reject) {
            // Make sure module is available when calling it's file
            let moduleName = className.split('_').slice(0,2).join("_");
            //console.log(moduleName);
            if ('awy_core_model_module_registry' in _singletons && moduleName !== 'awy_core') {
                let modReg = _singletons['awy_core_model_module_registry'];
                if (!modReg._modules.has(moduleName)){
                    throw new Error(moduleName + ' module is disabled!!! ' + className);
                }
            }
            
            //console.info(singleton);
            let key = [...rest, className].join('-');
            //console.info(key);
            //console.info(_classes);
            //console.info(_singletons);
            if (singleton && typeof _singletons[key] === 'object') {
                //console.log('resolving class ' + key + ' from singletons registry');
                return resolve(_singletons[key]);
            }
            // get original or overridden class instance
            className = className in _classes ? _classes[className]['class_name'] : className;
    
            let path = replaceAll(String(className), "_", '/');
            return System.import(path+'.js').then(file => {
                let instance = Object.create(file.default.prototype);
                file.default.call(instance, ...rest);
                //console.log(instance);
                if (singleton) {
                    //console.log('writting class ' + key  + ' into singletons registry');
                    _singletons[key] = instance;
                }
                return resolve(instance);
            }).catch(e => { return reject(e); });
        });
    }

    static processDI(className, ...rest : any[]) {

    }

    static overrideClass(className, newClassName, replaceSingleton = false) {
        let curModName = '';
        if ('awy_core_model_module_registry' in _singletons) {
            let modReg = _singletons['awy_core_model_module_registry'];
            curModName = modReg.currentModuleName();
        }
        //console.log('OVERRIDE CLASS: ' + className+ ' -> ' + newClassName + ' @ ' + curModName); 
        // override
        if (typeof newClassName === 'string') {
            _classes[className] = {
                'class_name': newClassName,
                'module_name': curModName,
            };
        // clear override
        } else if (null === newClassName) {
            if (!(className in _classes)) {
                return Promise.resolve(false);
            }
            delete _classes[className];
        }

        if (replaceSingleton && className in _singletons) {
            // configuration overrides don't replace singletons, so this is only accessed from code
            // so it's left to figure out what to return later
            return this.getInstance(newClassName).then(inst => {
                _singletons[className] = inst;
            });
        }
        return Promise.resolve(true);
        //console.log(_singletons);
    }
}


/*

USAGE

Class.i('Core_Model_Logger', 'App').then(debug => { 
    debug.warn('Class.i(Core_Model_Logger) SINGLETON WITH ARGUMENTS'); 
});

ClassRegistry.getInstance('Core_Model_Logger', true, 'App').then(log => {
    console.log('ClassRegistry.getInstance(Core_Model_Logger) SINGLETON WITH ARGUMENTS');
    console.log(log);  
});

ClassRegistry.getInstance('Core_Model_Logger', false, 'App').then(log1 => {
    console.log('ClassRegistry.getInstance(Core_Model_Logger) NEW INSTANCE WITH ARGUMENTS');
    console.log(log1);  
});

// this must extend Class 
this.Core_Model_Logger.then(debug => { 
    debug.warn('this.Core_Model_Logger SINGLETON WITHOUT ARGUMENTS');
});

// this must extend Class 
this.Debug.then(debug => { 
    debug.warn('same as this.Core_Model_Logger with DI config like 'Debug': 'Core_Model_Logger' '); 
});    

*/

//export default Aobject
