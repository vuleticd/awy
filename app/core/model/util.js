import {Aobject} from 'core/model/aobject';

class Core_Model_Util extends Aobject {
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
   * return all object properties and their values
   */
  entries(obj) {
    let result = [];
    for (let key of Object.keys(obj)) {
      result.push( [key, obj[key]] );
    }
      return result;
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

export default Core_Model_Util