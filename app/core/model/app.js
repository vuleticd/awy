import {Aobject} from 'core/model/aobject';
import Module from 'core/model/module';
import Logger from 'core/model/logger';
import Router from 'core/model/router';


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
    });
    //this.logger.info(System.loads);
		
	}

  init(area) {
    return Promise.all([
      this.initConfig(), 
      this.initModules(area)
    ]);
  }

  initModules(area) {
    /*
    if ($config->get('install_status') === 'installed') {
        $runLevels = [area => 'REQUIRED'];
    } else {
        $config->set('module_run_levels', []);
        $runLevels = [
            'install' => 'REQUIRED',
        ];
        area = 'install';
        $this->BRequest->setArea($area);
    }
    */
    return this.moduleRegistry.scan();
    /*
    this.moduleRegistry->processRequires();
    */
  }

  initConfig() {
    return new Promise(function(res, rej) {
      setTimeout(res, 10);
    });
  }
}