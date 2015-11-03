import {Aobject, ObjectRegistry} from 'core/model/aobject';
Class = Aobject;
ClassRegistry = ObjectRegistry;

class Bootstrap extends Class {
    constructor() {
      super();
      this.logger = Class.i('Core_Model_Logger', 'Bootstrap');    
      this.isInitialized = false;
    }

    /* 
     * window.document.readyState implementation
     */
    ready(global) {
      return new Promise((resolve, reject) => {
        if (global.document.readyState === 'complete') {
          resolve(global.document);
        } else {
          global.document.addEventListener('DOMContentLoaded', completed, false);
          global.addEventListener('load', completed, false);
        }

        function completed() {
          global.document.removeEventListener('DOMContentLoaded', completed, false);
          global.removeEventListener('load', completed, false);
          resolve(global.document);
        }
      });
    }

    initialize(): void {
      if (this.isInitialized) {
        return;
      }

      this.isInitialized = true;
    }

    run(area) {
      let appHost = false;
      this.ready(window).then(doc => {
          this.initialize();
          appHost = doc.querySelectorAll('[awy-app]');
          return this.Core_Model_App;
      }).then(app => {
          app.host = appHost[0];
          return app.run(area);
      }).catch(error => {
          this.logger.then(debug => { 
            debug.error('Error in Application Execution'); 
            debug.debug(error);
          });
      });
    }
};

export default Bootstrap;
