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

    userAgent(pattern = null) {
        return navigator.userAgent;
        //if (null === $pattern) {
        //    return $userAgent;
        //}
        //preg_match($pattern, $userAgent, $match);
        //return $match;
    }

    currentUrl() {
        return window.location.href;
    }

    scheme() {
        return window.location.protocol.replace(/:/,'');
    }

}

export default Core_Model_Router_Request