import {Aobject} from 'core/model/aobject';

let app = null;

class Bootstrap extends Aobject {
    constructor() {
      super();
      this.dbg = Aobject.i('Core_Model_Logger', 'Bootstrap');
      this.dbg.then(debug => { debug.warn('sdsdsdsds'); });
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
          console.log('Error in On Ready');
          console.log(error);
      }).then(doc => {
          this.initialize();
          appHost = doc.querySelectorAll('[awy-app]');
          return this.Core_Model_App;
      }, error => {
          console.log('Error in Application Initialization');
          console.log(error);
      }).then(app => {
          app.host = appHost[0];
          return app.run(area);
      }, error => {
          console.log('Error in Application Execution');
          console.log(error);
      });
    }
};

export default Bootstrap;
