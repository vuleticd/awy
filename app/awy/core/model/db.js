const DB_URL = 'https://torrid-heat-5927.firebaseio.com/';
// Chek this for reference on building logic of this class https://www.firebase.com/docs/rest/guide/structuring-data.html
class Awy_Core_Model_Db extends Class {
	constructor() {
		super();
		this.data_ref = new Firebase(DB_URL);
	}
}



export default Awy_Core_Model_Db;