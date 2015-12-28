class Awy_Core_Model_Migrate extends Class {
	constructor() {
		super();
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

	/**
    * Collect migration data from all modules
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
    	/*
        if (!$force) {
            $conf = $this->BConfig;
            $req = $this->BRequest;
            if ($conf->get('install_status') !== 'installed'
                || !$conf->get('db/implicit_migration')
                || $req->xhr() && !$req->get('MIGRATE')
            ) {
                return;
            }
        }
        */

        let modReg = await Class.i('awy_core_model_module_registry');
        let migration = await this.getMigrationData(modReg);
        if (!Object.keys(migration).length) {
        	alert('empty returen');
            return;
        }
        console.log(migration);
        /*
        if (is_string($limitModules)) {
            $limitModules = explode(',', $limitModules);
        }
        // initialize module tables
        // find all installed modules
        $num = 0;
        foreach ($migration as $connectionName => &$modules) {
            if ($limitModules) {
                foreach ($modules as $modName => $mod) {
                    if ((true === $limitModules && $mod['run_status'] === 'LOADED')
                        || (is_array($limitModules) && in_array($modName, $limitModules))
                    ) {
                        continue;
                    }
                    unset($modules[$modName]);
                }
            }
            $this->BDb->connect($connectionName); // switch connection
            $this->BDbModule->init(); // Ensure modules table in current connection
            // collect module db schema versions
            $dbModules = $this->BDbModule->orm()->find_many();
            foreach ($dbModules as $m) {
                if ($m->last_status === 'INSTALLING') { // error during last installation
                    $m->delete();
                    continue;
                }
                $modules[$m->module_name]['schema_version'] = $m->schema_version;
            }
            // run required migration scripts
            foreach ($modules as $modName => $mod) {
                if (empty($mod['code_version'])) {
                    continue; // skip migration of registered module that is not currently active
                }
                if (!empty($mod['schema_version']) && $mod['schema_version'] === $mod['code_version']) {
                    continue; // no migration necessary
                }
                if (empty($mod['script'])) {
                    BDebug::warning('No migration script found: ' . $modName);
                    continue;
                }

                $modules[$modName]['migrate'] = true;
                $num++;
            }
        }
        unset($modules);

        if (!$num) {
            return;
        }

        $this->BConfig->set('db/logging', 1);

        // TODO: move special cases from buckyball to fulleron
        // special case for FCom_Admin because some frontend modules require its tables
        if (empty($migration['DEFAULT']['FCom_Admin']['schema_version'])
            && empty($migration['DEFAULT']['FCom_Admin']['migrate'])
        ) {
            $this->BModuleRegistry->module('FCom_Admin')->run_status = BModule::LOADED;
            static::migrateModules('FCom_Core,FCom_Admin');
            //return;
        }

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