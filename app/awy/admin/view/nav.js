import Awy_Admin_View_Default from 'awy/admin/view/default.js';

class Nav_View extends Awy_Admin_View_Default {
	constructor(params) {
		super();
		this._params = params;
		this.set('tree',{});
		this.set('curNav',null);
	}

    render_nav(ref, html='') {
        html += '<ul>';
        for (let c in ref) {
            let node = ref[c];
            if (typeof node === 'object') {
                let hasChildren = this.hasObjects(node);
                html += '<li><a title="' + node.label + '" href="' + (node.href || '#') + '"><i class="' + node.icon_class + '"></i><span>' + node.label + '</span>';
                if (hasChildren) {
                    html += '<i class="icon-angle-down angle-down"></i>';
                } 
                html += '</a>';
                if (hasChildren) {
                    html = this.render_nav(node, html); // replace, don't append 
                } else {
                    html += '</li>';
                }
            }
        }
        //console.log('RENDER RESULT: ' , html);
        html += '</ul>';
        return html;
    }

    async addNav(args){
        console.log('addNav merge' , JSON.parse(JSON.stringify(this.get('tree'))), args[0]);
        this.objectMerge(this.get('tree'), args[0]);
        return this;
    }

    async removeNav(args){
        //console.log('removeNav' , JSON.parse(JSON.stringify(this.get('tree'))), args[0]);
        let root = this.get('tree');
        let path = args[0].split('/');
        let key;
        let parent;
        // traverse to last member in path, remember parent reference and key to delete
        for (let i in path){
            key = path[i];
            parent = root;
            root = root[key];
        }
        //console.log('removeNav' , parent, key, root);
        delete parent[key];
        return this;
    }

    objectMerge(...rest) {
      let base = rest.shift();
      for (let append of rest) {
        // base is not mergable, replace instead with last argument passed
        if (typeof base !== 'object') {
          return append;
        }
        // both base and argument are objects
        let key;
        for (key in append) {
            if (key in base) {
              base[key] = this.objectMerge(base[key], append[key]);
            } else {
              Object.assign(base,append);
            }
        }
      }
      return base;
    }

}
export default Nav_View