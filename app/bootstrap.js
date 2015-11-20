import {Aobject, ObjectRegistry} from 'awy/core/model/aobject';
Class = Aobject;
ClassRegistry = ObjectRegistry;

class Bootstrap extends Class {
    constructor() {
      super();
      this.logger = Class.i('awy_core_model_logger', 'Bootstrap');    
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

    async run(area) {
      try {
          let appHost = false;
          let doc = await this.ready(window);
          appHost = doc.querySelectorAll('[awy-app]');
          let app = await Class.i('awy_core_model_app');
          app.host = appHost[0];
          app.run(area);
      } catch (error) {
          (await this.logger).error(error); 
      }
    }
};

export default Bootstrap;
