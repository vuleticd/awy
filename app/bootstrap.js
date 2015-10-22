import Logger from 'core/model/logger';
import Util from 'core/model/util';

let app = null;

class Bootstrap {
    constructor() {
      this.logger = Logger.getInstance('Bootstrap');
      this.util = Util;
      this.isInitialized = false;
    }

    initialize(): void {
      if (this.isInitialized) {
        return;
      }

      this.isInitialized = true;
    }

    run(area) {
      return this.util.ready(window).then(doc => {
        this.initialize();
        let appHost = doc.querySelectorAll('[awy-app]');
        for (var i = 0, ii = appHost.length; i < ii; ++i) {
          System.import('core/model/app').then(m => {
            app = new m.App();
            app.host = appHost[i];
            app.run(area);
          });
        }
      });
    }
};

export default Bootstrap;
