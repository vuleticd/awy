import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Core_View_Root extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
		this.binders.rootClass = function(node, onchange) {
            return {
                updateProperty: async function(value) {
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
                }
            };
        }
		this.body_class = ['sdsdsd'];// [];
		this.addBodyClassFromRequest(); // async , not waiting
	}

	async addBodyClassFromRequest(){
		let req = await Class.i('awy_core_model_router_request');
		let scr = req.scriptName().replace(/[^a-z0-9]/g,'-').trim().toLowerCase();
		if (scr[0] == '-') {scr = scr.substring(1,scr.length);}
		if (scr[scr.length-1] == '-') {scr = scr.substring(0,scr.length-1);}
		this.addBodyClass(scr);		
	}

	addBodyClass(Bclass) {
        if (!this.contains(this.body_class, Bclass)) {
			this.body_class.push(Bclass);
	    }
        return this;
    }

    getBodyClass() {
    	//alert(this.body_class.join(' '));
        return this.body_class.join(' ');
    }

    contains(haystack, needle) {
    	return !!~haystack.indexOf(needle);
  	}	
}

export default Awy_Core_View_Root