class Core_Model_Module_Registry extends Class {
	constructor(key: Object) {
		super();
        this.logger = Class.i('Core_Model_Logger', 'Module_Registry');
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
    	this._modules = {};
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
		for (let mod in this._modules) {
			this.pushModule(mod);
            //this._modules.mod.onBeforeBootstrap();
            this.popModule();
		}

		for (let mod in this._modules) {
			this.pushModule(mod);
            //this._modules.mod.bootstrap();
            this.popModule();
		}

		this.Core_Model_Layout.then(layout => {
			layout.collectAllViewsFiles();
		});

		return this;
	}

	scan() {
		return this.getDefined().then(defined => {
			return Promise.all(
				// loaded defined modules in app/modules.js files
				defined.map(function([key, value]) {
					if (value.enabled) {
						return System.import(key + '/manifest').then(m => {
							m.default.key = key;
				            return m.default;
				          });
					}
				})).then(configs => { 
					// loaded manifest files
					return Promise.all(
						configs.map(function(manifest) {
									if (!('module_name' in manifest)) {
			            				throw "Invalid or empty manifest file: " + manifest.key + '/manifest.js';
			        				}
			        				manifest.manifest_file = manifest.key + '/manifest.js';
			        				//this.addModule(manifest.key, manifest);
			        				return ClassRegistry.getInstance('Core_Model_Module', false, manifest);
								}
						)
					);
				}).then(configs1 => {
					// loaded Module class instancess
					for (let index in configs1) { 
						this._modules[configs1[index].key] = configs1[index];
					}
					
					this.processRequires();
					return Promise.resolve(this);
				}).catch(err => {
					throw err;
				});
		}).catch(err => {
			throw err;
		});
	}

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

	/* 
     * return all defined modules, as promise
     */
	getDefined() {
		return System.import('modules').then(m => { 
			let result = [];
			for (let key of Object.keys(m.default)) {
			  	result.push( [key, m.default[key]] );
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
        //this.sortRequires();
        //return this;
    }

    checkRequires() {
    	// validate required modules
    	Class.i('Core_Model_Config').then(config => {
    		let requestRunLevels = config.get('module_run_levels/request');
    		for (let modName in requestRunLevels) {		
    			if (modName in this._modules) {
	                this._modules[modName]['run_level'] = requestRunLevels[modName]; //run level
	            } else {
	            	if (requestRunLevels[modName] === 'REQUIRED') {
	                	throw 'Module is required but not found: ' + modName;
	            	}
	            }
	        }
    	}).catch(err => { throw err;});

    	// scan for require
    	for (let modName1 in this._modules) {
    		let mod = this._modules[modName1];
            // is currently iterated module required?
            if (mod.run_level === 'REQUIRED') {
                mod.run_status = 'PENDING'; // only 2 options: PENDING or ERROR
            }
            // iterate over require for modules
        }
       
    	/*
        // scan for require

        foreach ($this->_modules as $modName => $mod) {
            // is currently iterated module required?
            if ($mod->run_level === BModule::REQUIRED) {
                $mod->run_status = BModule::PENDING; // only 2 options: PENDING or ERROR
            }
            // iterate over require for modules
            if (!empty($mod->require['module'])) {
                foreach ($mod->require['module'] as &$req) {
                    /// @var BModule $reqMod 
                    $reqMod = !empty($this->_modules[$req['name']]) ? $this->_modules[$req['name']] : false;
                    // is the module missing
                    if (!$reqMod) {
                        $mod->errors[] = ['type' => 'missing', 'mod' => $req['name']];
                        continue;
                    // is the module disabled
                    } elseif ($reqMod->run_level === BModule::DISABLED) {
                        $mod->errors[] = ['type' => 'disabled', 'mod' => $req['name']];
                        continue;
                    // is the module version not valid
                    } elseif (!empty($req['version'])) {
                        $reqVer = $req['version'];
                        if (!empty($reqVer['from']) && version_compare($reqMod->version, $reqVer['from'], '<')
                            || !empty($reqVer['to']) && version_compare($reqMod->version, $reqVer['to'], '>')
                            || !empty($reqVer['exclude']) && in_array($reqVer->version, (array)$reqVer['exclude'])
                        ) {
                            $mod->errors[] = ['type' => 'version', 'mod' => $req['name']];
                            continue;
                        }
                    }
                    if (!in_array($req['name'], $mod->parents)) {
                        $mod->parents[] = $req['name'];
                    }
                    if (!in_array($modName, $reqMod->children)) {
                        $reqMod->children[] = $modName;
                    }
                    if ($mod->run_status === BModule::PENDING) {
                        $reqMod->run_status = BModule::PENDING;
                    }
                }
                unset($req);
            }

            if (!$mod->errors && $mod->run_level === BModule::REQUESTED) {
                $mod->run_status = BModule::PENDING;
            }
        }

        foreach ($this->_modules as $modName => $mod) {
            if (!is_object($mod)) {
                var_dump($mod); exit;
            }
            if ($mod->errors && !$mod->errors_propagated) {
                // propagate dependency errors into subdependent modules
                $this->propagateRequireErrors($mod);
            } elseif ($mod->run_status === BModule::PENDING) {
                // propagate pending status into deep dependent modules
                $this->propagateRequires($mod);
            }
        }
        #var_dump($this->_modules);exit;
        */
        return this;
    }
}

export default Core_Model_Module_Registry