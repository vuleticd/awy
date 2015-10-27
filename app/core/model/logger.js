import {Aobject} from 'core/model/aobject';
/**
* @todo
* - implement global configuration for logging per enviroment
*/

let instances = {};
let singletonEnforcer = {};

class Core_Model_Logger extends Aobject {
  constructor(id: string, key: Object) {
    super();
    /*
    if (key !== singletonEnforcer) {
      throw new Error('You cannot instantiate "Logger". Use the "getInstance" API instead.');
    }
    */
    this.id = id || 'Default';
    this.slice = Array.prototype.slice;
    this.levels = {none: 0, error: 1, warn: 2, info: 3, debug: 4};
    this._level = this.levels.debug;
    return instances[this.id] || (instances[this.id] = this);
  }

  setLevel(level: number): void {
    this._level = level;
  }


  static getInstance(id: string): Core_Model_Logger {
    return instances[id] || (instances[id] = new Core_Model_Logger(id, singletonEnforcer));
  }

  log(level, args) {
    this[level].call(this, args);
  }

  debug( ...rest : any[]): void {
    if (this._level < 4) {
      return;
    }
    console.debug(`DEBUG [${this.id}]`, ...rest);
  }

  info( ...rest : any[]): void {
    if (this._level < 3) {
      return;
    }
    console.info(`INFO [${this.id}]`, ...rest);
  }

  warn( ...rest : any[]): void {
    if (this._level < 2) {
      return;
    }
    console.warn(`WARN [${this.id}]`, ...rest);
  }

  error( ...rest : any[]): void {
    if (this._level < 1) {
      return;
    }
    console.error(`ERROR [${this.id}]`, ...rest);
  }
}

/*

USAGE

import Logger from 'core/model/logger';  // IMPORT/USE

this.logger = Aobject.i(Logger, 'Bootstrap');  // INIT

this.logger.setLevel(0-4);  // SET LOGGING LEVEL FOR INSTANCE SCOPE 

this.logger.log('error',this.message); //  LOG
this.logger.error(this.message);  // OR LOG

Logger.i(false, 'Bootstrap'); // RETREIVE Bootstrap SINGLETON INSTANCE
Aobject.i(Logger, 'Bootstrap');  // RETREIVE Bootstrap SINGLETON INSTANCE

Logger.i(true, 'Bootstrap');  //  LAUNCH NEW Bootstrap LOGGER INSTANCE

Aobject.i(Logger, 'Bootstrap1') // LAUNCH NEW Bootstrap1 LOGGER 


Aobject.i(Logger);  // INIT Default LOGGER
Logger.i(); // RETREIVE Default LOGGER INSTANCE


*/

export default Core_Model_Logger