class Core_Model_Router_Request extends Class {
	constructor() {
		super();
		this._area = 'awy_frontend';
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
    
    httpHost(includePort = true) {
        if (includePort) {
            return window.location.host;
        }
        return window.location.hostname;
    }
    // test user agent
    isAgent(search) {
        return (navigator.userAgent.indexOf(search) > -1);
    }
    // full current URL
    currentUrl() {
        return window.location.href;
    }
    // HTTP or HTTPS
    scheme() {
        return window.location.protocol.replace(/:/,'');
    }
}

export default Core_Model_Router_Request