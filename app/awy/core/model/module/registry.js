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

	scan() {
		return this.getDefined().then(defined => {
			return Promise.all(
				// loaded defined modules in app/modules.js files
				defined.map(function([key, value]) {
					key = key.replace(/_/g,'/');
						return System.import(key + '/manifest').then(m => {
							m.default.key = key;
				            return m.default;
				          });
					//}
				})).then(configs => { 
					// loaded manifest files
					return Promise.all(
						configs.map(function(manifest) {
									if (!('module_name' in manifest)) {
			            				throw "Invalid or empty manifest file: " + manifest.key + '/manifest.js';
			        				}
			        				manifest.manifest_file = manifest.key + '/manifest.js';
			        				//this.addModule(manifest.key, manifest);
			        				return ClassRegistry.getInstance('awy_core_model_module', false, manifest);
								}
						)
					);
				}).then(configs1 => {
					// loaded Module class instancess
                    let index;
					for (index in configs1) { 
						this._modules.set(configs1[index].module_name, configs1[index]);
					}
					this.processRequires();
                    return this.processDefaultConfig();
				}).then(configs2 => {
                    //console.log(this._modules.get('Awy_Core'));
                    return Promise.resolve(this);
                }).catch(err => {
					throw err;
				});
		}).catch(err => {
			throw err;
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
	getDefined() {
		return System.import('modules').then(m => { 
			let result = [];
			for (let key of Object.keys(m.default)) {
                if (m.default[key].enabled) {
			  	  result.push( [key, m.default[key]] );
                }
			}
		  	return Promise.resolve(result);
		}).catch(err => {
			throw err;
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
        this.checkRequires();
        this.sortRequires();
        return this;
    }

    processDefaultConfig() {
        let modConf = [];
        for (let mod of this._modules.values()) {
            modConf.push(mod.processDefaultConfig());
        }
        //console.log(modConf);
        return Promise.all(modConf);
    }

    checkRequires() {
    	// validate required modules
    	Class.i('awy_core_model_config').then(config => {
    		let requestRunLevels = config.get('module_run_levels/request');
    		let modName;
            for (modName in requestRunLevels) {		
    			if (this._modules.has(modName)) {
	                this._modules.get(modName).run_level = requestRunLevels[modName]; //run level
	            } else {
	            	if (requestRunLevels[modName] === 'REQUIRED') {
	                	throw 'Module is required but not found: ' + modName;
	            	}
	            }
	        }
    	}).catch(err => { throw err;});
    	// scan for require
    	for (let [modName1, mod] of this._modules) {
            // is currently iterated module required?
            if (mod.run_level === 'REQUIRED') {
                mod.run_status = 'PENDING'; // only 2 options: PENDING or ERROR
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
                    } else if (reqMod.run_level === 'DISABLED') {
                        mod.errors.push({type: 'disabled', mod: req});
                        continue;
                    // is the module version not equal to required
                    } else if (!this.version_compare(reqMod.version, mod.require.module[req], '=')) {
                        mod.errors.push({type: 'version', mod: req});
                        continue;
                    }

                    if (!(req in mod.parents)) {
                        mod.parents.push(req);
                    }
                    if ( !(modName1 in reqMod.children)) {
                        reqMod.children.push(modName1);
                    }
                    if (mod.run_status === 'PENDING') {
                        reqMod.run_status = 'PENDING';
                    }
                }
            }

            if (mod.errors.length == 0 && mod.run_level === 'REQUESTED') {
                mod.run_status = 'PENDING';
            }
        }

        for (let [modName2, mod2] of this._modules) {
            if (typeof mod2 !== 'object') {
                console.error(mod2); return;
            }
            
            if (mod.errors.length > 0 && !mod.errors_propagated) {
                // propagate dependency errors into subdependent modules
                this.propagateRequireErrors(mod);
            } else if (mod.run_status === 'PENDING') {
                // propagate pending status into deep dependent modules
                this.propagateRequires(mod);
            }  
        }

        return this;
    }

    sortRequires() {
        let modules = this._modules;
        let circRefsArr = [];
        for (let [modName, mod] of modules) {
            let circRefs = this.detectCircularReferences(mod);
            if (circRefs.length) {
                /*
                foreach ($circRefs as $circ) {
                    $circRefsArr[join(' -> ', $circ)] = 1;

                    $s = sizeof($circ);
                    $mod1name = $circ[$s-1];
                    $mod2name = $circ[$s-2];
                    $mod1 = $modules[$mod1name];
                    $mod2 = $modules[$mod2name];
                    foreach ($mod1->parents as $i => $p) {
                        if ($p === $mod2name) {
                            unset($mod1->parents[$i]);
                        }
                    }
                    foreach ($mod2->children as $i => $c) {
                        if ($c === $mod1name) {
                            unset($mod2->children[$i]);
                        }
                    }
                }
                */
            }
        }
        let circRef;
        for(circRef in circRefsArr) {
            console.warn('Circular reference detected: ' + circRef);
        }
        // take care of 'load_after' option
        for (let [modName1, mod1] of modules) {
            mod1.children_copy = mod1.children;
            if ('load_after' in mod1 && Array.isArray(mod1.load_after)) {
                for (let n of mod1.load_after) {
                    if (!modules.has(n)) {
                        console.debug('Invalid module name specified in load_after: ' + n);
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

        let sorted = new Map(); // THIS IS NOT ORDERED, SO IT DOESN't ACTUALLY SORT ANYTHING. MUST FIND SOME BETTER ASSOCC ARRAY ORDERED TYPE TO USE INSTEAD OBJECT
        
        //let module_keys = Object.keys(modules);
        while(modules.size) {
            if (!rootModules.length) {
                console.warn('Circular reference detected, aborting module sorting');
                return false;
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

    detectCircularReferences(mod, depPathArr = []) {
        let circ = [];
        if (mod.parents.length) {
            for (let p of mod.parents) {
                if (p in depPathArr) {
                    let found = false;
                    let circPath = [];
                    let k;
                    for (k in depPathArr) {
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
                    let depPathArr1 = depPathArr;
                    depPathArr1.push(p);
                    let res = this.detectCircularReferences(this._modules.get(p), depPathArr1);
                    if (res.length > 0) {
                        circ.push(res);
                    }
                    //circ.push(this.detectCircularReferences(this._modules[p], depPathArr1));
                }
                
            }
        }

        return circ;
    }

    propagateRequireErrors(mod) {
        mod.run_status = 'ERROR';
        mod.errors_propagated = true;
        let childName;
        for (childName in mod.children) {
            if (!this._modules.has(childName)) {
                continue;
            }
            let child = this._modules.get(childName);
            if (child.run_level === 'REQUIRED' && child.run_status !== 'ERROR') {
                this.propagateRequireErrors(child);
            }
        }
        return this;
    }

    propagateRequires(mod) {
        let parentName;
        for (parentName in mod.parents) {
             if (!this._modules.has(parentName)) {
                continue;
            }
            parent = this._modules.get(parentName);
            if (parent.run_status === 'PENDING') {
                continue;
            }
            parent.run_status = 'PENDING';
            this.propagateRequires(parent);
        }
        return this;
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