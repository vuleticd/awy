// auto loader
System.paths['*'] = '/es5/app/*';

System.traceurOptions = {
    //annotations: true,
    types: true,
    memberVariables: true,
    sourceMaps: true,
    asyncFunctions: true
};

var Class = {};
var ClassRegistry = {};