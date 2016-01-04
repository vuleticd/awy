import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Core_View_Root extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
        /*
		this.binders.rootClass = function(node, propertyName, object) {
            return {
                updateProperty: async function() {
                    let value = object.get(propertyName);
                    //if (value !== node.value) {
                    	let req = await Class.i('awy_core_model_router_request');
						let scr = req.scriptName().replace(/[^a-z0-9]/g,'-').trim().toLowerCase();
                        if (scr[0] == '-') {scr = scr.substring(1,scr.length);}
						if (scr[scr.length-1] == '-') {scr = scr.substring(0,scr.length-1);}
                        if (!(!!~value.indexOf(scr))) {
                        	value.push(scr);
                        }

                        //alert(scr);
                        node.className = value.join(' ').trim();
                    //}
                },
                observer: (changes) => false
            };
        }
        this.set('body_class',  []);
        */
	}
    /*
    contains(haystack, needle) {
    	return !!~haystack.indexOf(needle);
  	}
    */	
}

export default Awy_Core_View_Root