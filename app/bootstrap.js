import {Aobject, ObjectRegistry} from 'core/model/aobject';
Class = Aobject;
ClassRegistry = ObjectRegistry;
let app = null;

class Bootstrap extends Class {
    constructor() {
      super();
      this.logger = Class.i('Core_Model_Logger', 'Bootstrap');    
      this.isInitialized = false;
    }

    initialize(): void {
      if (this.isInitialized) {
        return;
      }

      this.isInitialized = true;
    }

    run(area) {
      let appHost = false;
      this.Core_Model_Util.then(util => {
          return util.ready(window);
      }, error => {
          this.logger.then(debug => { 
            debug.error('Error in On Ready'); 
            debug.debug(error);
          });
      }).then(doc => {
          this.initialize();
          appHost = doc.querySelectorAll('[awy-app]');
          return this.Core_Model_App;
      }, error => {
          this.logger.then(debug => { 
            debug.error('Error in Application Initialization'); 
            debug.debug(error);
          });
      }).then(app => {
          app.host = appHost[0];
          return app.run(area);
      }, error => {
          this.logger.then(debug => { 
            debug.error('Error in Application Execution'); 
            debug.debug(error);
          }); 
      });
    }
};

export default Bootstrap;
