import {Aobject} from 'core/model/aobject';
import Logger from 'core/model/logger';
import Util from 'core/model/util';

let app = null;

class Bootstrap extends Aobject {
    constructor() {
      super();
      this.dbg = Aobject.i(Logger, 'Bootstrap');
      this.isInitialized = false;
    }

    initialize(): void {
      this.Core_Helper_View; // __call implementation
      if (this.isInitialized) {
        return;
      }

      this.isInitialized = true;
    }

    run(area) {
      return Util.i().ready(window).then(doc => {
        this.initialize();
        let appHost = doc.querySelectorAll('[awy-app]');
        for (var i = 0, ii = appHost.length; i < ii; ++i) {
          System.import('core/model/app').then(m => {
            app = new m.Core_Model_App();
            app.host = appHost[i];
            app.run(area);
          });
        }
      });
    }
};

export default Bootstrap;
