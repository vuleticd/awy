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

    /*
     * Init the Firebase URL configuration for app { db: { host: FIREBASE_URL }}
     * either from localeStorge or from app/db.js file
     * make sure result is written back to localStorage
     */
    async initDbHost(){
        // try to fetch from localStorage
        let config = JSON.parse(localStorage.getItem('db'));
        if (!config) {
          try {
            // try to fetch from configuration file
            let coreConfigFile = await System.import('db.js');
            config = coreConfigFile.default;
          } catch(e){
            // no FireHost configured yet, we are on initial installation steps
            return;
          }
        } else {
          config = { db: config };
        }
        // if found anywhere, add to config and write to localStorage
        this.add(config, true);
        this.writeLocalStorage('db', config.db);
    }
    /*
     * Init the core configuration for app
     * either from localeStorge or from Firebase/config path
     * make sure result, if present, is written back to localStorage
     */
    async initCoreConfiguration(){
        // try to fetch from localStorage
        let config = JSON.parse(localStorage.getItem('core'));
        let def = {
                'install_status': null,
                'module_run_levels': {},
            };
        if ( !config) {
          if (this.get('db/host') !== null) {
            // dont have core config but DB is there
            try {
              let db = await Class.i('awy_core_model_db');
              config = await db.rget('config');
              config = JSON.parse(config) || {};
              //alert(JSON.stringify(config));
            } catch(e){
              // DB connection can't be established
              //alert('CANT GET CORE CONFIG FROM DATABASE');
              config = def; //return;
            }
          } else {
            // dont have core config and DB HOST is missing, we are on initial installation steps
            config = def; //return;
          }
        } else {
          // core config in localStorage
        }

        // if found anywhere, add to config and write to localStorage
        if (config !== null) {
          this.add(config, true);
          this.writeLocalStorage('core', config);
        }
    }
    /*
     * write configuration section or full app configuration to localStorage, if available
     */ 
    writeLocalStorage(filename, config = null) {
        if(!this.storageAvailable('localStorage')) {
          return;
        }

        if (null === config) {
            config = this.configToSave;
        }

        let contents = JSON.stringify(config);
        localStorage.setItem( filename, contents );
    }
    // save Core config to Firebase as part of installation
    async writeCoreConfig() {
      let c = this.get(null, null, true);
      let copy = JSON.parse(JSON.stringify(c));
      delete(copy.db);
      delete(copy.fs);
      let db = await Class.i('awy_core_model_db');
      await db.rput(copy, 'config');
    }

    /*
     * save Firebase URL configuration to file.
     * use server side script to save file
     * used in installation
     */
    saveDbHostConfig() {
      if (this.get('db/host') === null) {
        return;
      }
      let c = this.get(null, null, true);
      let data = new FormData();
      data.append("data" , JSON.stringify(c.db.host));
      let xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
      xhr.open( 'post', '/c.php', false );
      xhr.send(data);
    }
    // write public global configuration to local storage
    async writeStorage(files = null) {
        console.log('writeLocalStorage');
        let util = await Class.i('awy_core_util_misc');
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
        //console.log(util.contains(files,'core'));
        let c = this.get(null, null, true);
        // !!!! THIS SHOULD GO INTO DB SOMEWHERE
        if (util.contains(files,'core')) {
          /*
            let noCoreConfigInLocalStorage = await this.addFile('core', true);
            if(noCoreConfigInLocalStorage == null) {
              //alert('NO Core Conf');
              if (this.get('db')) {
                alert('NO LS Core Conf and YES DB');
                // try to fetch core config from database and merge it into config
              } else {
                alert('NO LS Core Conf and NO DB'); // only possible on 1st steps of installation
              }  
            } else {
              alert('YES Core Conf');
              if (this.get('db')) {
                alert('YES LS Core Conf and YES DB');
              } else {
                alert('YES LS Core Conf and NO DB');
              }
            }
            */
            // configuration necessary for core startup
            if ('module_run_levels' in c && 'request' in c['module_run_levels']) {
              delete(c['module_run_levels']['request']);
            }
            //console.log(c);
            
            let core = {
                'install_status': 'install_status' in c ? c['install_status']: null,
                //'core': 'core' in c ? c['core']: null,
                'module_run_levels': 'module_run_levels' in c? c['module_run_levels']: {},
                //'recovery': 'recovery' in c ? c['recovery']: null,
                //'mode_by_ip': 'mode_by_ip' in c ? c['mode_by_ip']: {},
                //'cache': 'cache' in c ? c['cache']: {},
            };
            this.writeLocalStorage('core', core);
        }
        if (util.contains(files,'db')) {
            // Don't write to localStorage if there's no DB connection details
            let db = c['db'] || null;
            if (db) {
              this.writeLocalStorage('db', db);
            }
        }
        /*
        if (in_array('local', $files)) {
            // the rest of configuration
            $local = $this->BUtil->arrayMask($c,
                'db,install_status,module_run_levels,recovery,mode_by_ip,cache,core',
                true);
            $this->writeLocalStorage('local.php', $local);
        }
        */
        return this;
    }

    /**
     * Add configuration fragment to global tree
     */
    add(config, toSave = false) {
        let configCopy = JSON.parse(JSON.stringify(config));
        this.config = this.objectMerge(this.config, configCopy);
        if (this.enableSaving && toSave) {
            this.configToSave = this.objectMerge(this.configToSave, configCopy);
        } 
        return this;
    }

    // add configuration from local storage
    async addFile(filename, toSave = false) {
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
        /*
        if (!config && this.get('db')) {
          let db = await Class.i('awy_core_model_db');
          let ref = await db.connect();
          var self = this;
          ref.child('config').once("value", function(snapshot) {
            let instRef = snapshot.child("install_status");
            let instVal = instRef.val();
            config = {install_status: instVal};
            alert(JSON.stringify(config));
            self.add(config, toSave);
            return config;
          });
        } else {
          alert(JSON.stringify(config));
          */
          this.add(config, toSave);
          return config;
        //}
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
              //console.log('OBJECT MERGE');
              //console.log(base[key]);
              //console.log(append[key]);
              base[key] = this.objectMerge(base[key], append[key]);
            } else {
              Object.assign(base,append);
            }
        }
      }
      return base;
  }
}

export default Core_Model_Config
