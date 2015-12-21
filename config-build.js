// https://google.github.io/traceur-compiler/bin/traceur.js 
System.paths['traceur'] = '/lib/traceur.js';
// auto loader
System.config({
  baseURL: '/app'
});

System.traceurOptions = {
    //annotations: true,
    types: true,
    memberVariables: true,
    sourceMaps: true,
    asyncFunctions: true
};

var Class = {};
var ClassRegistry = {};