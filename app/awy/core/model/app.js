class Core_Model_App extends Class {
	constructor() {
      super();
      this.logger = Class.i('awy_core_model_logger', 'App'); 
      this.isInitialized = false;
      this.host = null;
    }

	run(area='frontend') {  
    return Promise.resolve(this.init(area)).then(modReg => {
        console.log('bootstrap');
        modReg.bootstrap();
        //return Class.i('awy_core_model_migrate');
    }).then(migrate => {
        console.log('migrate');
        //migrate.migrateModules(true);
        return Class.i('awy_core_model_router');
    }).then(router => {
        console.log('router dispatch');
        //return router.dispatch();
        return router;
    }).then(router => {
        console.log('router listen');
        Class.i('awy_core_model_config').then(config => { console.log(config); })
        return router.listen();
    }).catch(e => {
        Class.i('awy_core_model_layout').then(layout => {
          return layout.addView(
            'core/errors', 
            {template: '/app/awy/core/views/core/errors.html'}
          );
        }).then(layout => {
              layout.rootView = 'core/errors';
              layout.view('core/errors').set('errors', e);
              return Class.i('awy_core_model_router_response');
        }).then(response => {
              response.output();
              throw e;
        }).catch(e => {
            console.error(e);
        });
    });	
	}

  /*
   * return Core_Model_Module_Registry instance
   */
  init(area) {
    return Promise.resolve(
      this.initConfig(area)
    ).then(config => {
        return this.initModules();
    }).then(modReg => {
        this.initRouter();
        return modReg;
    });
  }

  initRouter() {
    console.log('initRouter');
    return Class.i('awy_core_model_router').then(router => {
        router.config({ mode: 'history'});
        return router;
      });
  }

  /*
   * return Core_Model_Module_Registry instance
   */
  initModules() {
    console.log('initModules');
    return Promise.all([
      Class.i('awy_core_model_config'), 
      Class.i('awy_core_model_router_request'),
      Class.i('awy_core_model_module_registry'),
    ]).then(deps => {
      let config = deps[0];
      let req = deps[1];
      let moduleRegistry = deps[2];

      let runLevels = {};

      let area = req.area;
      //runLevels['awy_core'] = 'REQUIRED';
      if (config.get('install_status') === 'installed') {
        runLevels[area] = 'REQUIRED';
      } else {
          config.set('module_run_levels', []);
          runLevels['awy_install'] = 'REQUIRED';
          area = 'awy_install';
          req.area = area;
      }
      /*
      runLevels += (array)$config->get('module_run_levels/request') +
                (array)$config->get('module_run_levels/' . $area) +
                (array)$config->get('module_run_levels/FCom_Core');
      */
      config.add({'module_run_levels': {'request': runLevels}});
      
      return moduleRegistry.scan();
      //return moduleRegistry;
    }).then(modules => {
      console.log("dbConfigFile localConfigFile");
      /*
      if (file_exists($dbConfigFile)) {
          $config->addFile($dbConfigFile, true);
      }

      $localConfigFile = $config->get('fs/config_file_local', $configDir . '/' . 'local.php');
      if (file_exists($localConfigFile)) {
          $config->addFile($localConfigFile, true);
      }
      */
      return Promise.resolve(modules);
    });
  }

  /*
   * return Core_Model_Config instance
   */
  initConfig(area) {
    console.log('initConfig');
    return Promise.all([
      Class.i('awy_core_model_config'), 
      Class.i('awy_core_model_router_request'),
    ]).then(deps => {
      let config =deps[0];
      let req =deps[1];

      let localConfig = {};
      let rootDir = config.get('fs/root_dir');
      if (!rootDir) {
        rootDir =  req.scriptDir();
      }
      localConfig.fs = { root_dir: rootDir };
      this.logger.then(debug => { debug.debug('ROOTDIR = ' + rootDir) });

      let coreDir = config.get('fs/core_dir');
      if (!coreDir) {
          coreDir = '/app/awy/core';
          config.set('fs/core_dir', coreDir);
      }
      config.add(localConfig, true);

      // try to add from localStorage, 
      // if there's nothing there generate initial local storage config for core
      // later change it with
      //    config.set('install_status', 'installedYEP', false, true);
      //    config.writeLocalStorage('core');
      if (config.addFile('core', true) == null) {
        config.writeLocalStorage('core');
      }
      req.area = area;

      return Promise.resolve(config);
    });
  }

  onBeforeBootstrap() {
    //alert('Core_Model_App.onBeforeBootstrap ');
    return Class.i('awy_core_model_layout').then(layout => {
        //alert('layout  Core_View_Base');
        layout.defaultViewClass = 'awy_core_view_base';
    });

/*
        $area = $this->BRequest->area();
        $conf = $this->BConfig;
        foreach (['cookie', 'web'] as $section) {
            $areaConfig = $conf->get("modules/{$area}/{$section}");
            if ($areaConfig) {
                $areaConfig = $this->BUtil->arrayCleanEmpty($areaConfig);
                if ($areaConfig) {
                    $conf->set($section, $areaConfig, true);
                }
            }
        }
        */
  }
}

export default Core_Model_App