import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Core_View_Text extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
		this._parts = {};
	}

	addText(name, text, params = {}) {
        if ('reset' in params) {
            this._parts = {};
        }

        this._parts[name] = {
            'text': text
        };
        return this;
    }

	async render(args = {}, retrieveMetaData = false) {
		let output = '';
		let n;
		for (p in this._parts) {
            output += "\n\n" + this._parts[n]['text'];
        }
		return output;
	}
}

export default Awy_Core_View_Text