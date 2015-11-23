let config =  {
	module_name: 'awy_install',
	version: '0.0.0.2',
	description: "Install sequence extension",
	require: { module: { awy_core: '0.0.0.1' } },
    /*load_after: ['awy_admin'],
    load_after: 'ALL',*/
	override: { class: [
			['awy_core_model_router','awy_install_model_router'],
		],
	},
	/* Should make possible to call Class.i('test_class') and get instance of class from
	app/awy/install/lib/class.js file
	autoload: [
		['test','lib']
	],*/
	/*translations: {'en':'en.js'}, */
	routing: [
		['install/index/*','install/controller/index']
	],
	/*default_config: {
            'modules/awy_install/something/else': 3,
    },*/
	themes: { 
		awy_install: {
        	layout_before: 'layout.yml',
        	views_before: 'views' 
        }
    },
}
export default config;