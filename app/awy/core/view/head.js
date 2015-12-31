import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Core_View_Head extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	// id, selector, rules, index
	css_rule(args) {
		let title = args.shift();
		let selector = args.shift();
		let rules = args.shift();
		let index = 0;
		let sheets = Array.from(document.styleSheets);
		let sheet = sheets.find((element, index, array) => element.title == title );
		if (!sheet) {
			sheet = this.css_raw([]);
		}
		if("insertRule" in sheet) {
			index = args.shift() || 0;
			sheet.insertRule(selector + "{" + rules + "}", index);
		}
		else if("addRule" in sheet) {
			index = args.shift() || -1;
			sheet.addRule(selector, rules, index);
		}
	}

	addStyle(href){
		let style = document.createElement("link");
		style.type = "text/css";
		style.rel = "stylesheet";
		style.href = href;
		// Add the <link> element to the page
		document.head.appendChild(style);

		return style.sheet;
	}

	async css(args){
		let modReg = await Class.i('awy_core_model_module_registry');
        let mod = modReg._modules.get(this.param('module_name'));
		let st;
		for (st of args) {
			let path = st.split('@');
			if (path.length == 2) {
				mod = modReg._modules.get(path[1]);
			}
			let stylePath = "/app/" + mod.root_dir + "/" + path[0];
			this.addStyle(stylePath);
		}
	}

	css_raw(args){
		let style = document.createElement("style");
		let st;
		for (st of args) {
			let path = st.split('=');
			if (path.length == 2) {
				style.setAttribute(path[0], path[1]);
			}
		}
		// WebKit hack :(
		style.appendChild(document.createTextNode(""));
		// Add the <style> element to the page
		document.head.appendChild(style);
		return style.sheet;
	}

	disable_css_raw(args){
		let title = args.shift();
		let sheets = Array.from(document.styleSheets);
		let sheet = sheets.find((element, index, array) => element.title == title );
		sheet.disabled = true;
	}

	enable_css_raw(args){
		let title = args.shift();
		let sheets = Array.from(document.styleSheets);
		let sheet = sheets.find((element, index, array) => element.title == title );
		sheet.disabled = false;
	}
/*
	url(path = null, full = true, method = 2)
    {
        return $this->BApp->href($path, $full, $method);
    }
    */
}

export default Awy_Core_View_Head