import {Aobject, ObjectRegistry} from 'awy/core/model/aobject.js';

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
    /*
     * when ready, init the app in 1st found selector with awy-app attribute 
     */
    async run(area) {
      try {
          let doc = await this.ready(window);
          let appHost = doc.querySelectorAll('[distro]');
          //let pace = await Class.i('awy_core_util_pace', appHost[0]);
          let app = await Class.i('awy_core_model_app');
          app.host = appHost[0];
          await app.run(area);
      } catch (error) {
          (await this.logger).error(error); 
      }
    }
};

export default Bootstrap;
