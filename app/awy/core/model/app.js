class Core_Model_App extends Class {
	constructor() {
      super();
      this.logger = Class.i('awy_core_model_logger', 'App'); 
      this.isInitialized = false;
      this.host = null;
    }

	run(area='frontend') {    
    this.init(area).then(values => {
        let config = values[0];
        let moduleRegistry = values[1];
        let router = values[2];
        let logger = values[3];
        //console.log(values);
        // bootstrap modules
        moduleRegistry.bootstrap();
        //alert('bootstrap');
        return Promise.resolve(values);
       /*
         // run module migration scripts if necessary
         $this->BMigrate->migrateModules(true);
         // dispatch requested controller action
         $this->BRouting->dispatch();
         // If session variables were changed, update session
         $this->BSession->close();
       */
       
    }).then(values => {
        //alert('bootstrap after');
        let moduleRegistry = values[1];
        let router = values[2];
        let logger = values[3];

        //logger.info(moduleRegistry);

        Class.i('awy_core_model_router_request').then(r => {
          //console.log(r.area);
        });

        //logger.info(area);
        router.listen();
    }).catch(err => {
        //console.log(err);
        Class.i('awy_core_model_layout').then(layout => {
          return layout.addView(
            'core/errors', 
            {template: '/app/awy/core/views/core/errors.html'}
          );
        }).then(layout => {
              layout.rootView = 'core/errors';
              layout.view('core/errors').set('errors', err);
              return Class.i('awy_core_model_router_response');
        }).then(response => {
              response.output();
        }).catch(error => {
            console.log(error);
        });
    });
    //this.logger.info(System.loads);
		
	}

  init(area) {
    return Promise.all([
      this.initConfig(area), 
      this.initModules(),
      this.initRouter(),
      this.logger
    ]);
  }

  initRouter() {
    return Class.i('awy_core_model_router').then(router => {
        router.config({ mode: 'history'});
        return router;
      });
  }

  initModules() {
    return Promise.all([
      Class.i('awy_core_model_config'), 
      Class.i('awy_core_model_router_request'),
      Class.i('awy_core_model_module_registry'),
      this.logger
    ]).then(val => {
      let config =val[0];
      let req =val[1];
      let moduleRegistry =val[2];
      let logger =val[3];
      let runLevels = {};

      let area = req.area;
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

      //console.log(config);
      let modules = moduleRegistry.scan();
      return Promise.resolve(modules);
    }).catch(err => {
      return Promise.reject(err);
    });
  }

  /*
   * return Core_Model_Config instance || errors {}
   */
  initConfig(area) {
    return Promise.all([
      Class.i('awy_core_model_config'), 
      Class.i('awy_core_model_router_request'),
      this.logger
    ]).then(val => {
      let config =val[0];
      let req =val[1];
      let logger =val[2];

      let localConfig = {};

      let rootDir = config.get('fs/root_dir');
      if (!rootDir) {
        rootDir =  req.scriptDir();
      }
      localConfig.fs = { root_dir: rootDir };
      this.logger.then(debug => { debug.debug('ROOTDIR = ' + rootDir) });

      let coreDir = config.get('fs/core_dir');
      if (!coreDir) {
          coreDir = '/app/core';
          config.set('fs/core_dir', coreDir);
      }
      config.add(localConfig, true);

      let errors = {};
      //errors.permissions = ['test'];
      if (Object.keys(errors).length) {
            throw errors;
      }
     
      return Promise.resolve(config);

    }).catch(err => {
      return Promise.reject(err);
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