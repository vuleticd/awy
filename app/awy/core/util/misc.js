class Awy_Core_Util_Misc extends Class {
	constructor() {
		super();
	}
	/* 
     * return true/false if value is found in array
     */
	contains(haystack, needle) {
        return !!~haystack.indexOf(needle);
    }

	version_compare(v1, v2, operator=false) {
        let compare = 0;
        v1 = this.prepVersion(v1);
        v2 = this.prepVersion(v2);
        let x = Math.max(v1.length, v2.length);
        for (let i = 0; i < x; i++) {
            if (v1[i] == v2[i]) {
              continue;
            }
            v1[i] = this.numVersion(v1[i]);
            v2[i] = this.numVersion(v2[i]);
            if (v1[i] < v2[i]) {
              compare = -1;
              break;
            } else if (v1[i] > v2[i]) {
              compare = 1;
              break;
            }
        }

        if (!operator) {
            return compare;
        }

        switch (operator) {
          case '>':
          case 'gt':
            return (compare > 0);
          case '>=':
          case 'ge':
            return (compare >= 0);
          case '<=':
          case 'le':
            return (compare <= 0);
          case '==':
          case '=':
          case 'eq':
            return (compare === 0);
          case '<>':
          case '!=':
          case 'ne':
            return (compare !== 0);
          case '':
          case '<':
          case 'lt':
            return (compare < 0);
          default:
            return null;
        }
    }

    prepVersion(v) {
      v = ('' + v).replace(/[_\-+]/g, '.');
      v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.');
      return (!v.length ? [-8] : v.split('.'));
    }

    numVersion(v) {
        return !v ? 0 : (isNaN(v) ? this.vm(v) || -7 : parseInt(v, 10));
    }

    vm(v) {
        switch (v) {
            case 'dev':
                return -6;
                break;
            case 'alpha':
            case 'a':
                return -5;
                break;
            case 'beta':
            case 'b':
                return -4;
                break;
            case 'RC':
            case 'rc':
                return -3;
                break;
            case '#':
                return -2;
                break;
            case 'p':
            case 'pl':
                return 1;
                break;
        }
    }

    /*
     * Recursevely merge input arrays and strings, producing new array without duplicated values 
     * @args - [[1, [1,3], 2, 3], [2, [1,2], 5, 6], 'a' , 'b', ['a','b','c']]
     * @result -  [1, [1, 3], 2, 3, [1, 2], 5, 6]
     */
    arrayMergeRecursive(args){
        //console.log('merge in', args);
        let res = [ ...new Set( Array.prototype.concat( ...args ) ) ];
        //console.log('merge out', res);
        return res;
    }
}
export default Awy_Core_Util_Misc