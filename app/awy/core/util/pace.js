class Awy_Core_Util_Pace extends Class {
    constructor(host) {
        super();
        this._host = host || null;
        if (this._host) {
            this.css_raw(['media=screen','title=pace']);
            this.css_rule(['pace','div#pace','display: block; position:absolute; top: 0; left: 0; z-index: 100; width: 100%; height: 100%; background-color: rgba(192, 192, 192, 0.5); background-image: url("http://i.stack.imgur.com/MnyxU.gif"); background-repeat: no-repeat; background-position: center;']);
            let loader = document.createRange().createContextualFragment(`<div id="pace"></div>`);
            this._host.appendChild(loader);
        }
        //console.log(loader);
    }

    css_raw(args){
        let style = document.createElement("style");
        let st;
        for (st of args) {
            let path = st.split('=');
            if (path.length == 2) {
                style.setAttribute(path[0], path[1]);
            }
        }
        // WebKit hack :(
        style.appendChild(document.createTextNode(""));
        // Add the <style> element to the page
        document.head.appendChild(style);
        return style.sheet;
    }

    css_rule(args) {
        let title = args.shift();
        let selector = args.shift();
        let rules = args.shift();
        let index = 0;
        let sheets = Array.from(document.styleSheets);
        let sheet = sheets.find((element, index, array) => element.title == title );
        if (!sheet) {
            sheet = this.css_raw([]);
        }
        if("insertRule" in sheet) {
            index = args.shift() || 0;
            sheet.insertRule(selector + "{" + rules + "}", index);
        }
        else if("addRule" in sheet) {
            index = args.shift() || -1;
            sheet.addRule(selector, rules, index);
        }
    }

}
export default Awy_Core_Util_Pace;
