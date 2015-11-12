import * as moduleConstants from 'awy/core/model/module';

class Core_Model_Module_Registry extends Class {
	constructor(key: Object) {
		super();
        this.logger = Class.i('awy_core_model_logger', 'Module_Registry');
        this.config = [];
        /**
	    * Current module name, not null when:
	    * - In module bootstrap
	    * - In observer
	    * - In view
	    */
	    this._currentModuleName = null;	
    	this._currentModuleStack = [];
    	/**
    	 * modules instances, collected from manifests
    	 */
    	this._modules = new Map();
    }

    pushModule(name) {
    	this._currentModuleStack.push(name);
        return this;
    }

    popModule() {
    	let name = this._currentModuleStack.pop();
        return this;
    }

    currentModuleName() {
        if (this._currentModuleStack.length > 0) {
            return this._currentModuleStack[this._currentModuleStack.length-1];
        }
        return null;
    }

	bootstrap() {
        return Promise.all(this._modules.keys()).then(mods => {
            for (let mod of mods) {
                this.pushModule(mod);
                //alert('pushModule1 ' + mod);
                this._modules.get(mod).onBeforeBootstrap().then(g => {
                    //alert('popModule1 ' + mod);
                    this.popModule();
                });
            }

            for (let mod of mods) {
                this.pushModule(mod);
                //alert('pushModule2 ' + mod);
                this._modules.get(mod).bootstrap().then(h => {
                    //alert('popModule2 ' + mod);
                    this.popModule();
                });
            }

            Class.i('awy_core_model_layout').then(layout => {
                //alert('layout.collectAllViewsFiles ');
                layout.collectAllViewsFiles();
            });

            return Promise.resolve(this);
        });
	}
    // Scan for all enabled module manifest files
	scan() {
        console.log('Module Registry scan');
        return Promise.resolve(
            this.getEnabled()
        ).then(defined => {
            return this.fetchManifests(defined);
        }).then(manifests => { 
            return this.initModules(manifests);
		}).then(modules => {
			// load modules into this._modules Map
            let index;
			for (index in modules) { 
				this._modules.set(modules[index].module_name, modules[index]);
			}
			return this.processRequires();
		}).then(() => {
            return this.processDefaultConfig();
        }).then(() => {
            console.log('Finished scan');
            return Promise.resolve(this);
        });
	}
/*
	addModule(modName, params) {
		if (modName in this._modules) {
			this.logger.then(debug => { debug.debug('MODULE UPDATE ' + modName) });
            //$this->_modules[$modName]->update($params);
        } else {
        	this.logger.then(debug => { debug.debug('MODULE ADD ' + modName) });
            ClassRegistry.getInstance('Core_Model_Module', false, params).then(m => {
            	this._modules[modName] = m;
            	console.log('after add module');
            });
        }
        return this;
	}
*/
	/* 
     * return all defined and hard enabled modules, as promise
     */
	getEnabled() {
        console.log('Fetching enabled modules from /app/modules.js');
		return System.import('modules').then(m => { 
			let result = [];
			for (let key of Object.keys(m.default)) {
                if (m.default[key].enabled) {
			  	  result.push( [key, m.default[key]] );
                }
			}
		  	return Promise.resolve(result);
		});
	}

    /* 
     * return all manifest.js files of all enabled modules
     */
    fetchManifests(defined) {
        console.log('Fetching manifest.js files of all enabled modules.');
        return Promise.all(
            defined.map(function([key, value]) {
                key = key.replace(/_/g,'/');
                return System.import(key + '/manifest').then(m => {
                            m.default.key = key;
                            return m.default;
                      });
            })
        ).then(manifests => { 
            return Promise.resolve(manifests); 
        });
    }
    /* 
     * return initilized modules for all passed manifests, as promise
     */
    initModules(manifests){
        console.log('Initilizing module objects for all manifests');
        return Promise.all(
            manifests.map(function(manifest) {
                if (!('module_name' in manifest)) {
                    throw "Invalid or empty manifest file: " + manifest.key + '/manifest.js';
                }
                manifest.manifest_file = manifest.key + '/manifest.js';
                //this.addModule() should be called instead, to either add or update module instance
                return ClassRegistry.getInstance('awy_core_model_module', false, manifest);
            })
        ).then(modules => { 
            return Promise.resolve(modules); 
        });
    }

	get configuration() {
		return this.config;
	}

	processOverrides() {
		ClassRegistry.overrideClass('one','two');
	}

	onBeforeBootstrap() {
		this.processOverrides();
	}

	processRequires() {
        return Promise.resolve(
            this.checkRequires()
        ).then(() => {
            return this.sortRequires();
        });
    }

    processDefaultConfig() {
        console.log('Processing default configuration for all modules');
        let modConf = [];
        for (let mod of this._modules.values()) {
            modConf.push(mod.processDefaultConfig());
        }
        //console.log(modConf);
        return Promise.all(modConf);
    }
    // check modules and switch either to PENDING or ERROR run_status
    checkRequires() {
        console.log('Checking for required modules and modules with errors');
    	// validate required modules
        Class.i('awy_core_model_config').then(config => {
    		let requestRunLevels = config.get('module_run_levels/request');
    		let modName;
            for (modName in requestRunLevels) {		
    			if (this._modules.has(modName)) {
	                this._modules.get(modName).run_level = requestRunLevels[modName]; //run level
	            } else {
	            	if (requestRunLevels[modName] === moduleConstants.REQUIRED) {
	                	throw 'Module is required but not found: ' + modName;
	            	}
	            }
	        }

            for (let [modName1, mod] of this._modules) {
                // switch into pending state if required
                if (mod.run_level === moduleConstants.REQUIRED) {
                    mod.run_status = moduleConstants.PENDING;
                }
                // iterate over require for modules
                if ('require' in mod && 'module' in mod.require) {
                    let req;
                    for (req in mod.require.module) {
                        let reqMod = this._modules.get(req) || false;
                        // is the module missing
                        if (!reqMod) {
                            mod.errors.push({type: 'missing', mod: req});
                            continue;
                        // is the module disabled
                        } else if (reqMod.run_level === moduleConstants.DISABLED) {
                            mod.errors.push({type: 'disabled', mod: req});
                            continue;
                        // is the module version not equal to required
                        } else if (!this.version_compare(reqMod.version, mod.require.module[req], '=')) {
                            mod.errors.push({type: 'version', mod: req});
                            continue;
                        }
                        // set parents
                        if (!(req in mod.parents)) {
                            mod.parents.push(req);
                        }
                        // set children
                        if ( !(modName1 in reqMod.children)) {
                            reqMod.children.push(modName1);
                        }
                        // if module is ok to run, set it's parents/dependencies as ok to run as well
                        if (mod.run_status === moduleConstants.PENDING) {
                            reqMod.run_status = moduleConstants.PENDING;
                        }
                    }
                    delete mod.require.module[req];
                }
                // switch into pending state if no errors 
                if (mod.errors.length == 0 && mod.run_level === moduleConstants.REQUESTED) {
                    mod.run_status = moduleConstants.PENDING;
                }
            }

            for (let [modName2, mod2] of this._modules) {
                if (typeof mod2 !== 'object') {
                    console.error(mod2); return;
                }
                if (mod2.errors.length > 0 && !mod2.errors_propagated) {
                    this.propagateErrors(mod2);
                } else if (mod2.run_status === moduleConstants.PENDING) {
                    this.propagateRequires(mod2);
                }  
            }

            return this;
    	});
    }

    // If module has errors, flag the run status to ERROR and do the same to all of it's required children
    propagateErrors(mod) {
        mod.run_status = moduleConstants.ERROR;
        mod.errors_propagated = true;
        let childName;
        for (childName of mod.children) {
            if (!this._modules.has(childName)) {
                continue;
            }
            let child = this._modules.get(childName);
            if (child.run_level === moduleConstants.REQUIRED && child.run_status !== moduleConstants.ERROR) {
                this.propagateRequireErrors(child);
            }
        }
        return this;
    }
    // if module is ok to run, flag the run status to PENDING for all of it's parent modules
    propagateRequires(mod) {
        let parentName;
        for (parentName of mod.parents) {
            if (!this._modules.has(parentName)) {
                continue;
            }
            parent = this._modules.get(parentName);
            if (parent.run_status === moduleConstants.PENDING) {
                continue;
            }
            parent.run_status = moduleConstants.PENDING;
            this.propagateRequires(parent);
        }
        return this;
    }

    sortRequires() {
        console.log('Perform topological sorting for module dependencies');
        //clone this._modules for temp use
        let modules = this._modules;//new Map(JSON.parse(JSON.stringify(Array.from(this._modules))));        
        let circRefsArr = [];
        for (let [modName, mod] of modules) {
            let circRefs = this.detectCircularReferences(mod);
            if (circRefs.length) {
                let circ;
                for (circ of circRefs) {
                    circRefsArr.push(circ.join(' -> '));
                    let s = circ.length;
                    let mod1name = circ[s-1];
                    let mod2name = circ[s-2];
                    let modul1 = modules.get(mod1name);
                    let modul2 = modules.get(mod2name);
                    let p;
                    for (p of modul1.parents) {
                        if (p === mod2name) {
                            modul1.parents.splice(modul1.parents.indexOf(p),1);
                        }
                    }
                    let c;
                    for (c of modul2.children) {
                        if (c === mod1name) {
                            modul2.children.splice(modul2.children.indexOf(c),1);
                        }
                    }
                }
            }
        }
        let circRef;
        for(circRef of circRefsArr) {
            console.warn('Circular reference detected: ' + circRef);
        }
        // take care of 'load_after' option
        for (let [modName1, mod1] of modules) {
            mod1.children_copy = mod1.children;
            if ('load_after' in mod1 && Array.isArray(mod1.load_after)) {
                for (let n of mod1.load_after) {
                    if (!modules.has(n)) {
                        throw new Error('Invalid module name specified in load_after: ' + n);
                        continue;
                    }
                    mod1.parents.push(n);
                    modules.get(n).children.push(modName1);
                }
            }
        }
        // get modules without dependencies
        let rootModules = [];
        for (let [modName2, mod2] of modules) {
            if (!mod2.parents.length) {
                rootModules.push(mod2);
            }
        }
        let sorted = new Map();
        //let module_keys = Object.keys(modules);
        while(modules.size) {
            if (circRefsArr.length) {
                throw new Error('Circular reference detected, aborting module sorting');
                //return false;
            }
            // remove this node from root modules and add it to the output
            let n = rootModules.pop();
            sorted.set(n.module_name, n);
            let c = n.children.length - 1;
            // for each of its children: queue the new node, finally remove the original
            while(c >= 0) {
            //for (let c in n.children) {
                // get child module
                let childModule = modules.get(n.children[c]);
                //console.log(childModule);
                // remove child modules from parent
                n.children.splice(c,1);
                //console.log(n.children);
                // remove parent from child module
                childModule.parents.splice(childModule.parents.indexOf(n.module_name),1);
                // check if this child has other parents. if not, add it to the root modules list
                if (!childModule.parents.length) { rootModules.push(childModule); }
                
                c--;
            }
            // remove processed module from list
            modules.delete(n.module_name);
            //module_keys.length--;
        }
        // move modules that have load_after=='ALL' to the end of list
        let srt = [];
        for (let [modName3, mod3] of sorted) {
            if (mod3.load_after === 'ALL') {
                sorted.delete(modName3);
                /*  ES6 Loader complains about delete followed by set on Map
                    So, srt Array is used instead
                if (!sorted.has(modName3)) {
                    sorted.set(modName3,mod3);
                }
                */
                srt.push(mod3);
            }
        }
        srt.forEach(function(obj) {
            sorted.set(obj.module_name, obj);
        });
        this._modules = sorted;
        return this;
    }

    contains(haystack, needle) {
        return !!~haystack.indexOf(needle);
    }
    /**
     * Detect circular module dependencies references
     */
    detectCircularReferences(mod, depPathArr = []) {
        let circ = [];
        //console.log(mod.module_name);
        //console.log(depPathArr);
        //console.log(mod.parents);
        if (mod.parents.length) {
            for (let p of mod.parents) {
                //console.log(p + ' is parent of ' + mod.module_name );
                if (this.contains(depPathArr, p)) {
                    //console.log('depPathArr contains ' + p);
                    let found = false;
                    let circPath = [];
                    let k;
                    for (k of depPathArr) {
                        //console.log(p + 'k in depPathArr ' + k);
                        if (p === k) {
                            found = true;
                        }
                        if (found) {
                            circPath.push(k);
                        }
                    }
                    circPath.push(p);
                    circ.push(circPath);
                } else {
                    //console.log('depPathArr does not contain ' + p);
                    let depPathArr1 = JSON.parse(JSON.stringify(depPathArr));
                    depPathArr1.push(p);
                    let b = this.detectCircularReferences(this._modules.get(p), depPathArr1);
                    circ = [...new Set([...circ, ...b])]
                }
                
            }
        } else {
            //console.log(mod.module_name  + ' has no parents and so no circ deps possible');
        }

        return circ;
    }

    version_compare(v1, v2, operator=false) {
        let compare = 0;
        v1 = this.prepVersion(v1);
        v2 = this.prepVersion(v2);
        let x = Math.max(v1.length, v2.length);
        for (let i = 0; i < x; i++) {
            if (v1[i] == v2[i]) {
              continue;
            }
            v1[i] = this.numVersion(v1[i]);
            v2[i] = this.numVersion(v2[i]);
            if (v1[i] < v2[i]) {
              compare = -1;
              break;
            } else if (v1[i] > v2[i]) {
              compare = 1;
              break;
            }
        }

        if (!operator) {
            return compare;
        }

        switch (operator) {
          case '>':
          case 'gt':
            return (compare > 0);
          case '>=':
          case 'ge':
            return (compare >= 0);
          case '<=':
          case 'le':
            return (compare <= 0);
          case '==':
          case '=':
          case 'eq':
            return (compare === 0);
          case '<>':
          case '!=':
          case 'ne':
            return (compare !== 0);
          case '':
          case '<':
          case 'lt':
            return (compare < 0);
          default:
            return null;
        }
    }

    prepVersion(v) {
      v = ('' + v).replace(/[_\-+]/g, '.');
      v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.');
      return (!v.length ? [-8] : v.split('.'));
    }

    numVersion(v) {
        return !v ? 0 : (isNaN(v) ? this.vm(v) || -7 : parseInt(v, 10));
    }

    vm(v) {
        switch (v) {
            case 'dev':
                return -6;
                break;
            case 'alpha':
            case 'a':
                return -5;
                break;
            case 'beta':
            case 'b':
                return -4;
                break;
            case 'RC':
            case 'rc':
                return -3;
                break;
            case '#':
                return -2;
                break;
            case 'p':
            case 'pl':
                return 1;
                break;
        }
    }
}

export default Core_Model_Module_Registry