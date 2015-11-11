class Core_Model_Config extends Class {
    constructor() {
      super();
      // Configuration storage
      this.config = {};
      // Configuration that will be saved on request
      this.configToSave = {};
      // ???? Enable double data storage for saving
      this.enableSaving = true;
    }

    storageAvailable(type) {
      try {
        let storage = window[type],
          x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
      }
      catch(e) {
        return false;
      }
    }

    writeFile(filename, config = null) {
        if (null === config) {
            config = this._configToSave;
        }

        let contents = JSON.stringify(config);
        
        localStorage.setItem( filename, contents );

        //console.log( JSON.parse( localStorage.getItem( filename ) ) );
    }

    // write public global configuration to local storage
    writeLocalStorage(files = null) {
        console.log('writeLocalStorage');
        if(!this.storageAvailable('localStorage')) {
          throw new Error('localStorage unavailable!!!!');
        }
        //TODO: make more flexible, to account for other (custom) file names
        if (null === files) {
            files = ['core', 'db', 'local'];
        }
        if (typeof files === 'string') {
            files = files.toLowerCase().split(',');
        }

        let c = this.get(null, null, true);
        // !!!! THIS SHOULD GO INTO DB SOMEWHERE
        if (files.findIndex(x => x == 'core') !== -1) {
            //console.log(c);
            // configuration necessary for core startup
            if ('module_run_levels' in c && 'request' in c['module_run_levels']) {
              delete(c['module_run_levels']['request']);
            }
            //console.log(c);
            
            let core = {
                'install_status': 'install_status' in c ? c['install_status']: null,
                'core': 'core' in c ? c['core']: null,
                'module_run_levels': 'module_run_levels' in c? c['module_run_levels']: {},
                'recovery': 'recovery' in c ? c['recovery']: null,
                'mode_by_ip': 'mode_by_ip' in c ? c['mode_by_ip']: {},
                'cache': 'cache' in c ? c['cache']: {},
            };
            this.writeFile('core', core);
        }
        /*
        if (in_array('db', $files)) {
            // db connections
            $db = !empty($c['db'])? ['db' => $c['db']]: [];
            $this->writeFile('db.php', $db);
        }
        if (in_array('local', $files)) {
            // the rest of configuration
            $local = $this->BUtil->arrayMask($c,
                'db,install_status,module_run_levels,recovery,mode_by_ip,cache,core',
                true);
            $this->writeFile('local.php', $local);
        }
        */
        return this;
    }

    /**
     * Add configuration fragment to global tree
     */
    add(config, toSave = false) {
        this.config = this.objectMerge(this.config, config);
        if (this.enableSaving && toSave) {
            this.configToSave = this.objectMerge(this.configToSave, config);
        } 
        return this;
    }

    // add configuration from local storage
    addFile(filename, toSave = false) {
        if(!this.storageAvailable('localStorage')) {
          throw new Error('localStorage unavailable!!!!');
        }
        /*
        if (preg_match('#^@([^/]+)(.*)#', $filename, $m)) {
            $module = $this->BModuleRegistry->module($m[1]);
            if (!$module) {
                BDebug::error($this->BLocale->_('Invalid module name: %s', $m[1]));
            }
            $filename = $module->root_dir . $m[2];
        }
        */
        let config = JSON.parse(localStorage.getItem(filename));

        //console.log(config);
        this.add(config, toSave);
        return config;
    }

    /**
     * Get configuration data using path
     * Config.i().get('test/blah/nah', 'DEFAULT_VALUE');
     */
    get(path = null, defaultValue = null, toSave = false) {
        let node = toSave ? this.configToSave : this.config;
        // .get() returns full configuration 
        if (null === path) {
            return node;
        }
        // Exit early if path is not found and return defaultValue or null
        for (let key of path.split('/')) {
            if (typeof node[key] === 'undefined') {
                return defaultValue;
            }
            node = node[key];
        }
        return node;
    }

    /**
     * Set configuration data in path location
     * Config.i().set('test/blah/nah', 'VALUE');
     */
    set(path, value, merge = false, toSave = false) {
      let node = this.config;
      if (typeof toSave === 'string' && toSave === 'configToSave') {
          node = this.configToSave;
      }
      let pathArray = path.split('/');
      let last = pathArray.pop();
      for (let key of pathArray) {
          node = node[key] || (node[key] = {});
      }
      
      if (merge) {
          node[last] = this.objectMerge(node[last], value);
      } else {
          node[last] = value;
      }

      
      if (this.enableSaving && toSave === true) {
          this.set(path, value, merge, 'configToSave');
      }

      return this;
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
              if (this.contains(base, val)) {
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

  /* 
   * return true/false if value is found in array
   */
  contains(haystack, needle) {
    return !!~haystack.indexOf(needle);
  }
}

export default Core_Model_Config
