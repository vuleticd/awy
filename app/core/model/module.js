import {Aobject,ObjectRegistry} from 'core/model/aobject';
import Modules from 'modules';
import Logger from 'core/model/logger';
import Util from 'core/model/util';

class Core_Model_Module extends Aobject {
	constructor(key: Object) {
		super();
        this.logger = Aobject.i(Logger, 'Module');
        this.config = [];
    }

	bootstrap() {
		this.onBeforeBootstrap();
	}

	scan() {
		let modulessDefined = Util.i().entries(Modules);
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

	processOverrides() {
		ObjectRegistry.overrideClass('one','two');
	}

	onBeforeBootstrap() {
		this.processOverrides();
	}
}

export default Core_Model_Module