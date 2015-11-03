class Core_Model_Config extends Class {
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
        this.config = this.objectMerge(this.config, config);
        if (this.enableSaving && toSave) {
            this.configToSave = this.objectMerge(this.configToSave, config);
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
          node[last] = this.objectMerge(node[last], value);
      } else {
          node[last] = value;
      }

      
      if (this.enableSaving && toSave === true) {
          this.set(path, value, merge, 'configToSave');
      }

      return this;
    }

  /*
   * Merges any number of objects / parameters recursively
   */
  objectMerge(...rest) {
      let base = rest.shift();
      for (let append of rest) {
        // base is not mergable, replace instead with last argument passed
        if (typeof base !== 'object') {
          return append;
        }
        // both base and argument are arrays
        if (Array.isArray(append) && Array.isArray(base)) {
            for (let val of append) {
              if (this.contains(base, val)) {
                  base[base.indexOf(val)] = val;
                  append.splice(append.indexOf(val), 1);
              }
            }
            base.push(...append);
        }
        // both base and argument are objects
        let key;
        for (key in append) {
            if (key in base) {
              base[key] = this.objectMerge(base[key], append[key]);
            } else {
              Object.assign(base,append);
            }
        }
      }
      return base;
  }

  /* 
   * return true/false if value is found in array
   */
  contains(haystack, needle) {
    return !!~haystack.indexOf(needle);
  }
}

export default Core_Model_Config
