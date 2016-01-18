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

    scriptName() {
        return window.location.pathname;
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

    ajax(method, url, args = null, data = null) {
        return new Promise( (resolve, reject) => {
            // Instantiates the XMLHttpRequest
            let client = new XMLHttpRequest();
            let uri = url;

            if (args && (method === 'GET' || method === 'DELETE' || method === 'POST' || method === 'PUT' || method === 'PATCH')) {
              uri += '?';
              let argcount = 0;
              for (let key in args) {
                if (args.hasOwnProperty(key)) {
                  if (argcount++) {
                    uri += '&';
                  }
                  uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                }
              }
            }

            client.open(method, uri);
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                client.send(data);
            } else {
                client.send();
            }

            client.onload = function() {
              if (this.status >= 200 && this.status < 300) {
                // Performs the function "resolve" when this.status is equal to 2xx
                resolve(this.response);
              } else {
                let resp = JSON.parse(this.response);
                // Performs the function "reject" when this.status is different than 2xx
                if (resp.error) {
                    reject(resp.error);
                } else {
                    reject(this.statusText);
                }
              }
            };
            client.onerror = function() {
                reject(this.statusText);
            };
        });
    }
}

export default Core_Model_Router_Request