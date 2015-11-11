// https://google.github.io/traceur-compiler/bin/traceur.js 
System.paths['traceur'] = '/lib/traceur.js';
// auto loader
System.paths['*'] = '/app/*.js';

System.traceurOptions = {
    //annotations: true,
    types: true,
    memberVariables: true
};

System.trace = true;

//import {Aobject} from 'core/model/aobject';
var Class = {};
var ClassRegistry = {};
//Base.Class = Aobject;

//System.execute = false;

//var modules = false;
//System.import('modules').then(m => { modules = m.default; });
/*
var systemNormalize = System.normalize;
// override the normalization function
System.normalize = function(name, parentName, parentAddress) {
	//console.log(modules); 
	console.log(name + "++" + parentName + "++" + parentAddress);
	return systemNormalize.call(this, name, parentName, parentAddress);
}

function fileExists(url) {
    if(url){
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.send();
        return req.status==200;
    } else {
        return false;
    }
}

var systemLocate = System.locate;
System.locate = function(load) {
	var loc = load.name.replace(/app/,'local');
	var dlc = load.name.replace(/app/,'dlc');
	if (fileExists(loc)) {
		load.name = loc;
	} else if (fileExists(dlc)) {
		load.name = dlc;
	}
	console.log(load.name); 
  	return load.name;
}
*/