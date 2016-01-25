import Awy_Admin_View_Default from 'awy/admin/view/default.js';

class Nav_View extends Awy_Admin_View_Default {
	constructor(params) {
		super();
		this._params = params;
		this.set('tree',{});
		this.set('curNav',null);
	}

	async addNav(args){
		let util = await Class.i('awy_core_util_misc');
		let path = args[0];
		let node = args[1];
        let root = this.get('tree');
        let pathArr = path.split('/');
        let l = pathArr.length-1;
        console.log('addNav', l, pathArr, node);
        let i;
        //root['/'] = {};
        for (i in pathArr){
        	let k = pathArr[i];
        	console.log('addNav', i, k);
        	console.log('addNav contains', !('/' in root));
        	let parent = root;
        	if (i < l && (!('/' in root) || !(k in root['/']))) {
        		console.log('addNav', 'Invalid parent path');
        	}

        	if (!('/' in root)) {
        		root['/'] = {};
        	}
        	root['/'][k] = node;
        	root = root['/'][k];
        }

        //root = node;
        return this;
        /*
        $l = sizeof($pathArr)-1;
        foreach ($pathArr as $i => $k) {
            $parent = $root;
            if ($i < $l && empty($root['/'][$k])) {
                $part = join('/', array_slice($pathArr, 0, $i + 1));
                $this->BDebug->warning('addNav(' . $path . '): Invalid parent path: ' . $part);
            }
            $root =& $root['/'][$k];
        }
        if (empty($node['pos'])) {
            $pos = 0;
            if (!empty($parent['/'])) {
                foreach ($parent['/'] as $k => $n) {
                    if (!empty($n['pos'])) {
                        $pos = max($pos, $n['pos']);
                    }
                }
            }
            $node['pos'] = $pos + 10;
        }
        if (!empty($node['href']) && !preg_match('/^https?:/', $node['href'])) {
            $node['href'] = $this->BApp->href($node['href']);
        }
        $root = $node;
        return $this;
        */
    }

}
export default Nav_View