class Core_Model_Router_Request extends Class {
	constructor() {
		super();
		this._area = 'frontend';
	}
	/**
    * Entry point relative directory path, leading and trailing slash included 
    */
    scriptDir() {
    	let dir = window.location.pathname.replace(/[^\\\/]*$/, '');
        return dir;
    }

    set area(area) {
        this._area = area;
    }

    get area(){
        return this._area;
    }

}

export default Core_Model_Router_Request