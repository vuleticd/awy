import {Aobject, ObjectRegistry} from 'aobject.js';

Class = Aobject;
ClassRegistry = ObjectRegistry;

class Bootstrap extends Class {
    constructor() {
      super();  
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
    async run() {
      try {
          let doc = await this.ready(window);
          let appHost = doc.querySelector(".template");
          let v = await Class.i('view');
          //v.withBinders(v.binders).bind(appHost, v);
           o = v;
          v.bindModel(appHost, v);

          //v.people[0].name = 'Updated';
      } catch (error) {
          console.error(error);
      }
    }

};

export default Bootstrap;
