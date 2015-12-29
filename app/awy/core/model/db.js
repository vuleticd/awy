//const DB_URL = 'https://torrid-heat-5927.firebaseio.com/';
// Chek this for reference on building logic of this class https://www.firebase.com/docs/rest/guide/structuring-data.html
class Awy_Core_Model_Db extends Class {
	constructor() {
		super();
		this.logger = Class.i('awy_core_model_logger', 'DB');
		/**
	    * Default DB connection name
	    */
	    this._defaultConnectionName = 'DEFAULT';

	    /**
	    * DB name which is currently referenced in BORM::$_db
	    */
	    this._currentConnectionName;

	    /**
	    * Current DB configuration
	    */
	    this._config = {};

		//this.data_ref = new Firebase(DB_URL);
	}

	async connect(name = null) {
		if (!name && this._currentConnectionName) { // continue connection to current db, if no value
            //return this.getDb();
        }

        if (null === name) { // if first time connection, connect to default db
            name = this._defaultConnectionName;
        }

        if (name === this._currentConnectionName) { // if currently connected to requested db, return
            //return this.getDb();
        }
        let config = await Class.i('awy_core_model_config');
        let dbCfg = config.get( this._defaultConnectionName ? 'db' : 'db/named/' + name);
        (await this.logger).debug("DB.CONNECT: " + name);
        console.log(dbCfg);
        this._currentConnectionName = name;
        this._config = dbCfg;
        return this.getDb();
    }

    getDb() {
    	console.log(this._config.host);
    	let ref = new Firebase(this._config.host);
    	ref.authWithCustomToken(this._config.key, function(error, authData) {
		  if (error) {
		    console.log("Authentication Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		  }
		});

        return ref;
    }
}



export default Awy_Core_Model_Db;