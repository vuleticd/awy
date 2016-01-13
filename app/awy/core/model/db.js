const MASTER_KEY = 'HkAgAjx75eRzC4sLqzV1HVw4rPmEFqqcTQcUSAt0';
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
        let dbRef = await this.getDb();
        return dbRef;
    }

    async getDb() {
    	return new Promise(function(resolve, reject) {
    		let ref = new Firebase(this._config.host);
    		ref.authWithCustomToken(/*this._config.key*/ MASTER_KEY, function(error, authData) {
				if (error) {
					return reject("Database Authentication Failed!" + error);
					//throw new Error("Database Authentication Failed!" + error);
				} else {
					console.log("Authenticated successfully with payload:", authData);
					return resolve(ref);
				}
			});

    	}.bind(this));
    }

    async get(path= null, name = null) {
    	let ref = await this.connect(name);
    	return new Promise( (resolve, reject) => {
    		ref.child(path).once("value", function(snapshot) {
    			resolve(snapshot.val());
            });
    	});
    }

    /*
     * write a string, number, boolean, array or any JSON object to our Firebase database.
     * equivalent to set() in our JavaScript SDK.
     * supports silent | pretty output.
     * !! overwrite the data at the specified location, including any child nodes.
     */
    async rput(data, path= null, name = null, print = 'silent') {
        let ref = await this.connect(name);
        let req = await Class.i('awy_core_model_router_request');
        let result = await req.ajax('PUT', this._config.host + '/'+ path +'.json', {"auth": /*this._config.key*/ MASTER_KEY, "print": print}, JSON.stringify(data));
        return result;
    }   
    /*
     * update specific children at a location without overwriting existing data
     * supports multi-path updates.
     * supports silent | pretty output.
     * pretty response will contain the updated data written to the database.
     */
    async rpatch(data, path= null, name = null, print = 'silent') {
        let ref = await this.connect(name);
        let req = await Class.i('awy_core_model_router_request');
        let result = await req.ajax('PATCH', this._config.host + '/'+ path +'.json', {"auth": /*this._config.key*/ MASTER_KEY, "print": print}, JSON.stringify(data));
        return result;
    }
    /*
     * generate a unique, timestamp-based key for every child added to a Firebase database 
     * supports silent | pretty output.
     * pretty response will contain the key "name" of the new data that was added
     */
    async rpost(data, path= null, name = null, print = 'pretty') {
        let ref = await this.connect(name);
        let req = await Class.i('awy_core_model_router_request');
        let result = await req.ajax('POST', this._config.host + '/'+ path +'.json', {"auth": /*this._config.key*/ MASTER_KEY, "print": print}, JSON.stringify(data));
        return result;
    }
    /*
     * remove data from the database path
     * response containing JSON null
     */
    async rdelete(path= null, name = null) {
        if ( path === null) {
            return;
        }
        let ref = await this.connect(name);
        let req = await Class.i('awy_core_model_router_request');
        let result = await req.ajax('DELETE', this._config.host + '/'+ path +'.json', {"auth": /*this._config.key*/ MASTER_KEY});
        return result;
    }
    /*
     *  read data from our Firebase database
     *  pretty response will contain the data we're retrieving
     *  shallow: true || false (Default)  -- shallow cannot be used with other query parameters.
     * params
     *      print : pretty(Default) || silent
     *      callback: function reference
     *      orderBy: $key || $value || $priority || common child key name
     *      startAt:
     *      endAt:
     *      limitToFirst:
     *      limitToLast:
     *      equalTo:
     */
    async rget(path= null, name = null, params = {}, shallow = false) {
        let ref = await this.connect(name);
        let req = await Class.i('awy_core_model_router_request');

        if (shallow === true) {
            let shallowRes = await req.ajax('GET', this._config.host + '/'+ path +'.json', {"auth": /*this._config.key*/ MASTER_KEY, "shallow": true});
            return shallowRes;
        }
        params["auth"] = /*this._config.key*/ MASTER_KEY;
        let result = await req.ajax('GET', this._config.host + '/'+ path +'.json', params);
        return result;
    }
    /*
     * subscribe to changes to a single location in our Firebase database
     */
    async listen(path= null, eventname="put", name = null) {
        let ref = await this.connect(name);
        let evtSource = new EventSource(this._config.host + '/'+ path +'.json?auth=' + /*this._config.key*/ MASTER_KEY);
        //let eventList = document.createElement("ul");
        evtSource.addEventListener(eventname, function(e) {
          //let newElement = document.createElement("li");
          let obj = JSON.parse(e.data);
          let epath = obj.path;
          let evalue = obj.data;
          if (evalue === null) {
            console.log("Path: " + path + epath + " has been removed");
          } else {
            console.log("Path: " + path + epath + " has new value: ", evalue);
          }
          //newElement.innerHTML = "ping at " + obj.time;
          //eventList.appendChild(newElement);
        }, false);
    }
}



export default Awy_Core_Model_Db;