class Core_Model_App extends Class {
	constructor() {
      super();
      this.logger = Class.i('Core_Model_Logger', 'App'); 
      this.router = this.Core_Model_Router;
      this.router.then(router => {
        router.config({ mode: 'history'});
      });
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
       /*
         // run module migration scripts if necessary
         $this->BMigrate->migrateModules(true);
         // dispatch requested controller action
         $this->BRouting->dispatch();
         // If session variables were changed, update session
         $this->BSession->close();
       */
       logger.info(moduleRegistry);
       logger.info(area);
       router.listen();
    }, reason => {
        this.Core_Model_Layout.then(layout => {
          return layout.addView(
            'core/errors', 
            {template: '/app/core/views/core/errors.html'}
          );
        }).then(layout => {
              layout.rootView = 'core/errors';
              layout.view('core/errors').set('errors', reason);
              return this.Core_Model_Router_Response;
        }).then(response => {
              response.output();
        }).catch(err => {
            console.log(err);
        });
    //   Layout.i().addView('core/errors', {template: '/app/core/views/core/errors.html'});
    //   Layout.i().rootView = 'core/errors';
    //   Layout.i().view('core/errors').set('errors', reason);
    //   Response.i().output();
    //   //console.log(Layout.i().view('core/errors').set('errors', reason));
    //   /*
    //   $this->BResponse->output();
    //   */
    });
    //this.logger.info(System.loads);
		
	}

  init(area) {
    return Promise.all([
      this.initConfig(area), 
      this.initModules(area),
      this.router,
      this.logger
    ]);
  }

  initModules(area) {
    return Promise.all([
      this.Core_Model_Config, 
      this.Core_Model_Router_Request,
      this.Core_Model_Module_Registry,
      this.logger
    ]).then(val => {
      let config =val[0];
      let req =val[1];
      let moduleRegistry =val[2];
      let logger =val[3];
      if (config.get('install_status') === 'installed') {
        //$runLevels = [area => 'REQUIRED'];
      } else {
          config.set('module_run_levels', []);
          /*
          $runLevels = [
              'install' => 'REQUIRED',
          ];
          */
          area = 'install';
          req.area = area;
      }
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
      this.Core_Model_Config, 
      this.Core_Model_Router_Request,
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
}

export default Core_Model_App