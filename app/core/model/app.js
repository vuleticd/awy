import {Aobject} from 'core/model/aobject';
import Module from 'core/model/module';
import Logger from 'core/model/logger';
import Router from 'core/model/router';
import Request from 'core/model/router/request';
import Config from 'core/model/config';
import Layout from 'core/model/layout';


export class Core_Model_App extends Aobject {
	constructor() {
      super();
      this.logger = Aobject.i(Logger, 'App');
      this.router = Aobject.i(Router);
      this.router.config({ mode: 'history'});
      this.moduleRegistry = Aobject.i(Module);
      this.isInitialized = false;
      this.host = null;
    }

	run(area='frontend') {
    this.init(area).then(m => {
      // bootstrap modules
      this.moduleRegistry.bootstrap();
      /*
        // run module migration scripts if necessary
        $this->BMigrate->migrateModules(true);
        // dispatch requested controller action
        $this->BRouting->dispatch();
        // If session variables were changed, update session
        $this->BSession->close();
      */
      this.logger.info(this.moduleRegistry.configuration);
      this.logger.info(area);
      this.router.listen();
    }, reason => {
      //console.log(reason);
      Layout.i().addView('core/errors', {template: '/app/core/views/core/errors.html'});
      Layout.i().rootView = 'core/errors';
      Layout.i().view('core/errors').set('errors', reason);
      //console.log(Layout.i().view('core/errors').set('errors', reason));
      /*
      $this->BResponse->output();
      */
    });
    //this.logger.info(System.loads);
		
	}

  init(area) {
    return Promise.all([
      this.initConfig(area), 
      this.initModules(area)
    ]);
  }

  initModules(area) {
    let config = Config.i(); 
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
        Request.i().area = area;
        //console.log(Request.i());
    }
    
    return this.moduleRegistry.scan();
    /*
    this.moduleRegistry->processRequires();
    */
  }

  initConfig(area) {
    return new Promise(function(res, reject) {
      let req = Request.i();
      let config = Config.i();

      let localConfig = {};

      let rootDir = config.get('fs/root_dir');
      if (!rootDir) {
        rootDir =  Request.i().scriptDir();
      }
      localConfig.fs = { root_dir: rootDir };
      this.logger.debug('ROOTDIR = ' + rootDir);

      let coreDir = config.get('fs/core_dir');
      if (!coreDir) {
          coreDir = '/app/core';
          config.set('fs/core_dir', coreDir);
      }

      config.add(localConfig, true);

      let errors = {};
      //errors.permissions = ['test'];
      if (Object.keys(errors).length) {
            reject(errors);
            return;
      }

      console.log(Config.i());
      setTimeout(res, 10);
    }.bind(this));
  }
}