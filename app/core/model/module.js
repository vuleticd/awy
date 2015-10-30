class Core_Model_Module extends Class {
	constructor(key: Object) {
		super();
        this.logger = Class.i('Core_Model_Logger', 'Module');
        this.config = [];
    }

	bootstrap() {
		this.onBeforeBootstrap();
	}

	scan() {
		return this.getDefined().then(defined => {
			return Promise.all(
				defined.map(function([key, value]) {
					if (value.enabled) {
						return System.import(key + '/etc/config').then(m => {
					            this.config.push(m.default);
					            //return m.default;
					          });
					}
				}, this)).then(configs => { 
					return Promise.resolve(this);
				}).catch(err => {
					throw err;
				});
		}).catch(err => {
			throw err;
		});
	}

	/* 
     * return all defined modules, as promise
     */
	getDefined() {
		return System.import('modules').then(m => { 
			let result = [];
			for (let key of Object.keys(m.default)) {
			  	result.push( [key, m.default[key]] );
			}
		  	return Promise.resolve(result);
		}).catch(err => {
			throw err;
		});
	}

	get configuration() {
		return this.config;
	}

	processOverrides() {
		ClassRegistry.overrideClass('one','two');
	}

	onBeforeBootstrap() {
		this.processOverrides();
	}
}

export default Core_Model_Module