class Awy_Core_Migrate extends Class {
	constructor() {
		super();
	}

	async install() {
		//let db = await Class.i('awy_core_model_db');
		//let host = db._config.host;
		//let key = db._config.key;
		let rules = { "rules": { 
			"modules": {
				".read": false,
				".write": false 
			},
			"config": {
				".read": false,
				".write": false 
			}
		}};
		return rules;
		//let client = new XMLHttpRequest();
    	//client.open('PUT', host + '/.settings/rules.json?auth=' + key, true);
    	//client.send(JSON.stringify(rules));
    	//console.log(client);
	}

	async upgrade() {
		console.log('core upgrade');
	}

	async downgrade() {
		console.log('core downgrade');
	}
}
export default Awy_Core_Migrate