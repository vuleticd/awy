import {Aobject} from 'core/model/aobject';
import Util from 'core/model/util';

class Core_Model_Config extends Aobject {
    constructor() {
      super();
      // Configuration storage
      this.config = {};
      // Configuration that will be saved on request
      this.configToSave = {};
      // ???? Enable double data storage for saving
      this.enableSaving = true;
    }

    /**
     * Add configuration fragment to global tree
     */
    add(config, toSave = false) {
        this.config = Util.i().objectMerge(this.config, config);
        if (this.enableSaving && toSave) {
            this.configToSave = Util.i().objectMerge(this.configToSave, config);
        } 
        return this;
    }

    /**
     * Get configuration data using path
     * Config.i().get('test/blah/nah', 'DEFAULT_VALUE');
     */
    get(path = null, defaultValue = null, toSave = false) {
        let node = toSave ? this.configToSave : this.config;
        // .get() returns full configuration 
        if (null === path) {
            return node;
        }
        // Exit early if path is not found and return defaultValue or null
        for (let key of path.split('/')) {
            if (typeof node[key] === 'undefined') {
                return defaultValue;
            }
            node = node[key];
        }
        return node;
    }

    /**
     * Set configuration data in path location
     * Config.i().set('test/blah/nah', 'VALUE');
     */
    set(path, value, merge = false, toSave = false) {
        let node = this.config;
        if (typeof toSave === 'string' && toSave === 'configToSave') {
            node = this.configToSave;
        }
        let pathArray = path.split('/');
        let last = pathArray.pop();
        for (let key of pathArray) {
            node = node[key] || (node[key] = {});
        }
        
        if (merge) {
            node[last] = Util.i().objectMerge(node[last], value);
        } else {
            node[last] = value;
        }

        
        if (this.enableSaving && toSave === true) {
            this.set(path, value, merge, 'configToSave');
        }
        
        return this;
    }
}

export default Core_Model_Config
