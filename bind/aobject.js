
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

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
}