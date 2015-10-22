class Util {
  /* 
   * window.document.readyState implementation
   */
  static ready(global) {
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
  static entries(obj) {
    let result = [];
    for (let key of Object.keys(obj)) {
      result.push( [key, obj[key]] );
    }
      return result;
  }
}

export default Util