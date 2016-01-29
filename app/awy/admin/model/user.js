class AdminUser_Model extends Class {
    constructor() {
      super();
      this.logger = Class.i('awy_core_model_logger', 'AdminUser_Model');  
    }

    async createUser(email, password) {
    	let db = await Class.i('awy_core_model_db');
    	if (db._connection === null) {
            await db.connect();
        }

    	return new Promise( (resolve, reject) => {
            db._connection.createUser({
			  email    : email,
			  password : password
			}, (error, userData) => {
			  if (error) {
			  	reject(error);
			  } else {
			  	resolve(userData);
			  }
			});
    	});
    }
    // @todo - this can create the Firebase user but fail to write user data to admin_user  
    async create(data){
		let db = await Class.i('awy_core_model_db');
    	if (db._connection === null) {
            await db.connect();
        }
        // only super admin can create admin user
        let auth = await db.sudo();
    	let userData = await this.createUser(data.email, data.password);
    	delete data.email;
    	delete data.password;
	    await db.rput(data, 'admin_user/' + userData.uid);
		await db.rput(true, 'admin_role/superadmin/members/' + userData.uid);
		(await this.logger).debug("Successfully created Admin user account with uid:", userData.uid);
    }

    async auth(email, password){
    	let db = await Class.i('awy_core_model_db');
    	if (db._connection === null) {
            await db.connect();
        }
        return new Promise( (resolve, reject) => {
	    	db._connection.authWithPassword({
			  email    : email,
			  password : password
			}, (error, authData) => {
			  if (error) {
			  	reject(error);
			  } else {
			    //console.log("Authenticated successfully with payload:", authData);
			    resolve(authData);
			  }
			});
		});
    }

    async logout(){
    	let db = await Class.i('awy_core_model_db');
    	if (db._connection === null) {
            await db.connect();
        }
    	db._connection.unauth();
    }

     async resetPassword(email) {
        let db = await Class.i('awy_core_model_db');
        if (db._connection === null) {
            await db.connect();
        }

        return new Promise( (resolve, reject) => {
            db._connection.resetPassword({
              email    : email
            }, (error) => {
              if (error) {
                reject(error);
              } else {
                resolve(true);
              }
            });
        });
     }

}

export default AdminUser_Model