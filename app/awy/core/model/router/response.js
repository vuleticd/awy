class Core_Model_Router_Response extends Class {
	constructor() {
		super();
        this._contentType = 'text/html';
        this._charset = 'UTF-8';
        this._content = null;
	}

    render(){

    }

    async output(type = null) {
        if (null !== type) {
            this.setContentType(type);
        }

/*
        let headers = ['Content-Type: ' . this._contentType . '; charset=' . this._charset];
        let confHeaders = Config.i().get('web/headers');
        for (hKey in confHeaders) {
            headers[] = hKey . ': ' . confHeaders[hKey];
        }

        this.header(headers);
*/
        if (this._contentType == 'application/json') {
            if (null !== this._content) {
                this._content = this._content;// is_string($this->_content) ? $this->_content : $this->BUtil->toJson($this->_content);
            }
        } else if (null === this._content) {
            let l = await Class.i('awy_core_model_layout');
            //Class.i('awy_core_model_layout').then(l => {
                //console.log(l);
                this._content = await l.render();
            //});
            //this._content = Layout.i().render();
        }
        //let parser = new DOMParser();
        //this._content = parser.parseFromString(this._content, "text/xml");
        let app = await Class.i('awy_core_model_app');
        console.log(typeof this._content);
        HTML.ify(app.host);
        app.host.add("" + this._content);
        //app.host.insertAdjacentHTML('beforeend', this._content);


        //app.host.appendChild(this._content.firstChild);
        //console.log(this._content.firstChild);
        //document.body.insertBefore(this._content.firstChild, app.host); 
        //app.host.insertBefore(this._content);
        

        /*
        $this->BEvents->fire(__METHOD__ . ':before', ['content' => &$this->_content]);

        if ($this->_contentPrefix) {
            echo $this->_contentPrefix;
        }
        if ($this->_content) {
            echo $this->_content;
        }
        if ($this->_contentSuffix) {
            echo $this->_contentSuffix;
        }

        $this->BEvents->fire(__METHOD__ . ':after', ['content' => $this->_content]);

        $this->shutdown(__METHOD__);
        */
    }

    setContentType(type) {
        this._contentType = type;
        return this;
    }

    header(header, replace = true, httpResponseCode = null) {
        /*
        if (headers_sent($file, $line)) {
            $this->BDebug->notice("Can't send header: '" . print_r($header, 1) . "', output started in {$file}:{$line}");
            return $this;
        }
        if (is_string($header)) {
            header($header, $replace, $httpResponseCode);
        } elseif (is_array($header)) {
            foreach ($header as $h) {
                header($h, $replace, $httpResponseCode);
            }
        }
        */
        return this;
    }

    
    redirect(url, status = 302) {
        /*
        $this->BSession->close();
        this.status(status, null, false);
        if (true === $url) {
            $referrer = $this->BRequest->referrer();
            $url = $referrer ? $referrer : $this->BRequest->currentUrl();
        } elseif (!$this->BUtil->isUrlFull($url)) {
            $url = $this->BApp->href($url);
        }
        */
        window.location = url;
        /*
        $this->shutdown(__METHOD__);
        */
    }

}

export default Core_Model_Router_Response