import Modules from 'modules';
import Logger from 'core/model/logger';
import Util from 'core/model/util';

class Module {
	constructor(key: Object) {
        this.logger = Logger.getInstance('Module');
        this.config = [];
    }

	bootstrap() {

	}

	scan() {
		let modulessDefined = Util.entries(Modules);
		return Promise.all(modulessDefined.map(function([key, value]) {
			if (value.enabled) {
				return System.import(key + '/etc/config').then(m => {
			            this.config.push(m.default);
			            //return m.default;
			          });
			}
		}, this));
	}

	get configuration() {
		return this.config;
	}
}

export default Module