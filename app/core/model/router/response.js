import {Aobject} from 'core/model/aobject';
import Config from 'core/model/config';
import Layout from 'core/model/layout';

class Core_Model_Router_Response extends Aobject {
	constructor() {
		super();
        this._contentType = 'text/html';
        this._charset = 'UTF-8';
        this._content = null;
	}

    output(type = null) {
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
            this._content = Layout.i().render();
            console.log(this._content);
        }
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

}

export default Core_Model_Router_Response