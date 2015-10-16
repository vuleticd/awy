import Logger from 'log/model/logger';
import Util from 'core/model/util';

import {PLATFORM} from 'core/model/platform-interface';
import {DOM} from 'core/model/dom-interface';

let isInitialized = false;

let bootstrapQueue = [];
let sharedLoader = null;
let Awy = null;

class App {
    constructor(message) {
      this.message = message;
      this.logger = Logger.getInstance('App');
      this.util = Util;
    }

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
      if (isInitialized) {
        return;
      }

      isInitialized = true;

      this.util.ensureBootstrap();

      this.initializePAL((platform, feature, dom) => {
        Object.assign(platform, PLATFORM);
        Object.assign(feature, this.util.getFeature());
        Object.assign(dom, DOM);

        Object.defineProperty(dom, 'title', {
          get: function() {
            return document.title;
          },
          set: function(value) {
            document.title = value;
          }
        });

        Object.defineProperty(dom, 'activeElement', {
          get: function() {
            return document.activeElement;
          }
        });

        Object.defineProperty(platform, 'XMLHttpRequest', {
          get: function() {
            return platform.global.XMLHttpRequest;
          }
        });
      });
    }

    initializePAL(callback: (platform: Platform, feature: Feature, dom: Dom) => void): void {
      if (typeof Object.getPropertyDescriptor !== 'function') {
        Object.getPropertyDescriptor = function(subject, name) {
          let pd = Object.getOwnPropertyDescriptor(subject, name);
          let proto = Object.getPrototypeOf(subject);
          while (typeof pd === 'undefined' && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
          }
          return pd;
        };
      }

      callback(PLATFORM, this.util.getFeature(), DOM);
    }

    run() {
      var element = document.querySelector('#message');
      element.innerHTML = this.message;

      return this.ready(window).then(doc => {
        this.initialize();
        
        let appHost = doc.querySelectorAll('[awy-app]');
        return this.createLoader().then(loader => {
          return this.preparePlatform(loader).then(() => { 
            /*
            for (let i = 0, ii = appHost.length; i < ii; ++i) {
              handleApp(loader, appHost[i]).catch(console.error.bind(console));
            }

            sharedLoader = loader;
            for (let i = 0, ii = bootstrapQueue.length; i < ii; ++i) {
              bootstrapQueue[i]();
            }
            bootstrapQueue = null;
            */
          });
        });
      });
    }

    createLoader() {
      if (PLATFORM.Loader) {
        return Promise.resolve(new PLATFORM.Loader());
      }
    
      let bootstrapperName = System.normalize('bootstrap');
      let loaderName = System.normalize('core/model/module/default');
      return System.import(loaderName).then(m => new m.DefaultLoader());

      throw new Error('No PLATFORM.Loader is defined and there is neither a System API (ES6) or a Require API (AMD) globally available to load your app.');
    }

    preparePlatform(loader) {
      this.logger.info(loader);
      let bootstrapperName = loader.normalize('bootstrap');
    
      let frameworkName = loader.normalize('core/model/app', bootstrapperName);
      this.logger.info(frameworkName);
      loader.map('core/model/app', frameworkName);
      /*
      let diName = loader.normalizeSync('aurelia-dependency-injection', frameworkName);
      loader.map('aurelia-dependency-injection', diName);

      let routerName = loader.normalizeSync('aurelia-router', bootstrapperName);
      loader.map('aurelia-router', routerName);
      */
      let loggingConsoleName = loader.normalize('log/model/logger', bootstrapperName);
      loader.map('log/model/logger', loggingConsoleName);

      return loader.loadModule(frameworkName).then(m => Awy = m.Awy);
    }
};

var app = new App('Hello, Awy!');
app.run();

//export var app = bootstrap(App);
//app.run();