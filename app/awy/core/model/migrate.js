class Awy_Core_Model_Migrate extends Class {
	constructor() {
		super();
        this.logger = Class.i('awy_core_model_logger', 'Migrate');
	}

	async methodExists(obj, method) {
        try {
            let clbClass = await Class.i(obj);
            return typeof clbClass[method] === 'function';
        } catch(e) {
            return false;
        }
    }

    async classExists(obj) {
    	return await this.methodExists(obj, 'constructor');
    }

    /*
    * Merges any number of objects / parameters recursively
    */
    objectMerge(...rest) {
      let base = rest.shift();
      for (let append of rest) {
        // base is not mergable, replace instead with last argument passed
        if (typeof base !== 'object') {
          return append;
        }
        // both base and argument are arrays
        if (Array.isArray(append) && Array.isArray(base)) {
            for (let val of append) {
              if (!!~base.indexOf(val)) {
                  base[base.indexOf(val)] = val;
                  append.splice(append.indexOf(val), 1);
              }
            }
            base.push(...append);
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

	/**
    * Collect migration data from all modules with valid migration scripts found
    *
    * @return array
    */
    async getMigrationData(modReg = null) {
        let migration = {};
        if (!modReg) {
        	modReg = await Class.i('awy_core_model_module_registry');
    	}
        for (let [modName, mod] of modReg._modules) {
        	// set the migration class in manifest of use default
            if (!('migrate' in mod)) {
            	let defaultExist = await this.classExists(mod.module_name + '_migrate');
            	if (defaultExist) {
                	mod.migrate = mod.module_name + '_migrate';
            	}
            } else {
            	let customExist = await this.classExists(mod.migrate);
            	if (!customExist) {
                	delete mod.migrate;
            	}
            }
            
            if (mod.version && mod.migrate) {
                let connName = mod.db_connection_name || 'DEFAULT';
                if (!(connName in migration)) {
                	migration[connName] = {};
                }
        
                migration[connName][modName] = {
                    'code_version': mod.version,
                    'script': mod.migrate,
                    'run_status': mod.run_status,
                    'module_name': modName,
                    'connection_name': connName,
                };
            }
            
        }
        (await this.logger).debug("MIGRATION DATA: ");
        (await this.logger).debug(migration);
        return migration;
    }

	/**
    * Run declared migration scripts to install or upgrade module DB scheme
    *
    * @param mixed $limitModules
    *   - false: migrate ALL declared modules (including disabled)
    *   - true: migrate only enabled modules in current request
    *   - array or comma separated string: migrate only specified modules
    */
    async migrateModules(limitModules = false, force = false, redirectUrl = null) {
    	
        if (!force) {
            let config = await Class.i('awy_core_model_config');
            if (config.get('install_status') !== 'installed' || !config.get('db/implicit_migration')) {
                return;

            }
            /*
            $req = $this->BRequest;
            if ($conf->get('install_status') !== 'installed'
                || !$conf->get('db/implicit_migration')
                || $req->xhr() && !$req->get('MIGRATE')
            ) {
                return;
            }
            */
        }
        

        let modReg = await Class.i('awy_core_model_module_registry');
        let util = await Class.i('awy_core_util_misc');
        let req = await Class.i('awy_core_model_router_request');
        let db = await Class.i('awy_core_model_db');

        let migration = await this.getMigrationData(modReg);
        if (!Object.keys(migration).length) {
            return;
        }
        //console.log(migration);
    
        if (typeof limitModules === 'string') {
            limitModules = limitModules.split(/\s*,\s*/);
        }
        //console.log(limitModules);
        // initialize module tables
        // find all installed modules
        let num = 0;
        let connectionName;
        for (connectionName in migration) {
            let modules = migration[connectionName];
            //console.log(modules);
            if (limitModules !== false) {
                for (let modName of Object.keys(modules)){
                    let mod = modules[modName];
                    if ((true === limitModules && mod['run_status'] === 'LOADED')
                        || (Array.isArray(limitModules) && util.contains(limitModules,modName))
                    ) {
                        (await this.logger).debug("KEEP MIGRATION FOR: " + modName);
                        continue;
                    }
                    (await this.logger).debug("SKIP MIGRATION FOR: " + modName);
                    delete modules[modName];
                }
            }


            let ref = await db.connect(connectionName); // switch connection
            // collect module db schema versions
            let modulesSnapshotJson = await db.rget('modules');
            let modulesSnapshot = JSON.parse(modulesSnapshotJson) || {};
            Object.keys(modulesSnapshot).forEach(async function(mKey) {
                let mData = modulesSnapshot[mKey];
                if (mData.last_status === 'INSTALLING') { // error during last installation
                    await db.rdelete('modules/' + mKey);
                } else {
                    modules[mKey]['schema_version'] = mData.schema_version;
                }
            });

            //console.log(modules);
            //$this->BDbModule->init(); // Ensure modules table in current connection
            
            // run required migration scripts
            for (let modName of Object.keys(modules)){
                let mod = modules[modName];
                if (!('code_version' in mod)) {
                    (await this.logger).warn( modName + ' not currently active');
                    continue; // skip migration of registered module that is not currently active
                }
                if ('schema_version' in mod && mod['schema_version'] === mod['code_version']) {
                    (await this.logger).warn( modName + ' no migration necessary');
                    continue; // no migration necessary
                }
                if (!('script' in mod)) {
                    (await this.logger).warn("No migration script found: " + modName);
                    continue;
                }

                modules[modName]['migrate'] = true;
                num++;
            }
            
        }
        //delete modules;
        //console.log(num);
        if (!num) {
            return;
        }
        // collect security rules for migration
        let migrationRulesArray = [];
        for (connectionName in migration) {
            let modules = migration[connectionName];
            for (let modName of Object.keys(modules)){
                let mod = modules[modName];
                if (!('migrate' in mod)) {
                    continue;
                }
                let action = null;
                // write migration data to Firebase
                await db.rput({ 
                    'schema_version': mod['code_version'],
                    'last_upgrade': {".sv": "timestamp"},
                    'last_status': 'INSTALLING' 
                }, 'modules/' + modName);
                //console.warn(JSON.parse(JSON.stringify(mod)));
                if (!('schema_version' in mod)) {
                    action = 'install';
                } else if (util.version_compare(mod.schema_version, mod.code_version, "<")) {
                    action = 'upgrade';
                } else if (util.version_compare(mod.schema_version, mod.code_version, ">")) {
                    action = 'downgrade';
                }
                if (action !== null && this.methodExists(mod.script,action)) {
                    let clbClass = await Class.i(mod.script);
                    let rule = await clbClass[action]();
                    rule = rule || {};
                    migrationRulesArray.push(rule);
                    // write migration data to Firebase
                    await db.rpatch({'last_status': 'INSTALLED'}, 'modules/'+ modName);
                    (await this.logger).debug("INCLUDE MIGRATION RULES: " + JSON.stringify(rule) + " FROM MODULE: " + modName);
                }

            }
        }
        //console.warn(migrationRulesArray.length);
        if (migrationRulesArray.length) {
            let f = await db.rget('.settings/rules');
            let rules = JSON.parse(f);
            (await this.logger).debug("OLD RULES: " + JSON.stringify(rules));
            let migrationRule;
            for(migrationRule of migrationRulesArray){
                rules = this.objectMerge(rules, migrationRule);
            }
            //install merged security rules
            let ff = await db.rput(rules, '.settings/rules');//await req.ajax('PUT', db._config.host + '/.settings/rules.json', {"auth": db._config.key}, JSON.stringify(rules));
            (await this.logger).debug("NEW RULES: " + JSON.stringify(rules));
        }

        //$this->BConfig->set('db/logging', 1);
        /*
        if (class_exists('FCom_Core_Main')) {
            $this->BConfig->writeConfigFiles('core');
        }

        $this->BResponse->startLongResponse();
        $view = $this->BView;
        echo '<html><body><h1>Migrating modules DB structure...</h1><pre>';
        $i = 0;
        $error = false;
        try {
            static::$_breakFlag = false;

            foreach ($migration as $connectionName => $modules) {
                $this->BDb->connect($connectionName);

                foreach ($modules as $modName => $mod) {
                    if (empty($mod['migrate'])) {
                        continue;
                    }

                    echo '<br>[' . (++$i) . '/' . $num . '] ';
                    $action = null;
                    if (empty($mod['schema_version'])) {
                        echo 'Installing <strong>' . $view->q($modName . ': ' . $mod['code_version']) . '</strong> ... ';
                        $action = 'install_upgrade';
                    } elseif (version_compare($mod['schema_version'], $mod['code_version'], '<')) {
                        echo 'Upgrading <strong>' . $view->q($modName . ': ' . $mod['schema_version'] . ' -> ' . $mod['code_version']) . '</strong> ... ';
                        $action = 'install_upgrade';
                    } elseif (version_compare($mod['schema_version'], $mod['code_version'], '>')) {
                        echo 'Downgrading <strong>' . $view->q($modName . ': ' . $mod['schema_version'] . ' -> ' . $mod['code_version']) . '</strong> ... ';
                        $action = 'downgrade';
                    }
                    if (empty($action)) {
                        continue;
                    }

                    $modReg->currentModule($modName);
                    $script = $mod['script'];
                    if (is_array($script)) {
                         if (!empty($script['file'])) {
                             $filename = $this->BModuleRegistry->module($modName)->root_dir . '/' . $script['file'];
                             if (!file_exists($filename)) {
                                 BDebug::warning('Migration file not exists: ' . $filename);
                                 continue;
                             }
                             require_once $filename;
                         }
                         $script = $script['callback'];
                    }
                    $module = $modReg->module($modName);
                    static::$_migratingModule =& $mod;

                        $this->BDb->ddlClearCache(); // clear DDL cache before each migration step
                        BDebug::debug('DB.MIGRATE ' . $view->q($script));
                        if (is_callable($script)) {
                            $result = $this->BUtil->call($script);
                        } elseif (is_file($module->root_dir . '/' . $script)) {
                            $result = include_once($module->root_dir . '/' . $script);
                        } elseif (is_dir($module->root_dir . '/' . $script)) {
                            //TODO: process directory of migration scripts
                        } elseif (class_exists($script, true)) {
                            if ($action === 'install_upgrade') {
                                if (method_exists($script, 'run')) {
                                    $this->{$script}->run();
                                } else {
                                    static::_runInstallUpgradeClassMethods($modName, $script);
                                }
                            } elseif ($action === 'downgrade') {
                                if (method_exists($script, 'downgrade')) {
                                    $this->{$script}->downgrade();
                                } else {
                                    static::_runDowngradeClassMethods($modName, $script);
                                }
                            }
                        }
                    if (static::$_breakFlag) {
                        break 2;
                    }

                }
            }
        } catch (Exception $e) {
            $trace = $e->getTrace();
            foreach ($trace as $traceStep) {
                if (strpos($traceStep['file'], BUCKYBALL_ROOT_DIR) !== 0) {
                    break;
                }
            }
            echo "\n\n" . $e->getMessage();
            if (!static::$_lastQuery) {
                static::$_lastQuery = BORM::get_last_query();
            }
            if (static::$_lastQuery) {
                echo "\n\nQUERY: " . static::$_lastQuery;
            }
            echo "\n\nLOCATION: " . $traceStep['file'] . ':' . $traceStep['line'];
            $error = true;
        }
        $modReg->currentModule(null);
        static::$_migratingModule = null;

        $url = null !== $redirectUrl ? $redirectUrl : $this->BRequest->currentUrl();
        echo '</pre>';
        if (!$error) {
            echo '<script>location.href="' . $url . '";</script>';
            echo '<p>ALL DONE. <a href="' . $url . '">Click here to continue</a></p>';
        } else {
            echo '<p>There was an error, please check the output or log file and try again.</p>';
            echo '<p><a href="' . $url . '">Click here to continue</a></p>';
        }
        echo '</body></html>';
        exit;
        */
    }
	/*
	!!! Updating security rules on Firebase database
	let rules = { "rules": { ".read": true }};
	let client = new XMLHttpRequest();
    client.open('PUT', 'https://torrid-heat-5927.firebaseio.com/.settings/rules.json?auth=HkAgAjx75eRzC4sLqzV1HVw4rPmEFqqcTQcUSAt0', true);
    client.send(JSON.stringify(rules));
	*/
}

export default Awy_Core_Model_Migrate;