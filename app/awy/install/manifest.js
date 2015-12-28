let config =  {
	module_name: 'awy_install',
	version: '0.0.0.2',
	description: "Install sequence extension",
	require: { module: { awy_core: '0.0.0.1' } },
	areas: {
        awy_install: {
            views: {
                root: { view_class: 'awy_core_view_root' },
                index: { view_class: 'awy_core_view_index' },
                step1: { view_class: 'awy_install_view_step1'},
                step2: { view_class: 'awy_install_view_step2' },
                step3: { view_class: 'awy_install_view_step3' },
            },
            //auto_use: [ 'bootstrap', 'views' ],
            //before_bootstrap: { callback: "awy_admin_admin.onBeforeBootstrap" },
        },
    },
    /*load_after: ['awy_admin'],
    load_after: 'ALL',
	override: { class: [
			['awy_core_model_router','awy_install_model_router'],
		],
	},
	Should make possible to call Class.i('test_class') and get instance of class from
	app/awy/install/lib/class.js file
	autoload: [
		['test','lib']
	],*/
	/*translations: {'en':'en.js'}, */
	routing: [
		['/','awy_install_controller.index'],
		['/install','awy_install_controller.index'],
		['/install/step1','awy_install_controller.step1'],
		['/install/step2','awy_install_controller.step2'],
		['/install/step3','awy_install_controller.step3'],
		['/install/.action','awy_install_controller']
	],
	/*default_config: {
            'modules/awy_install/something/else': 3,
    },*/
	themes: { 
		awy_install: {
        	layout_before: 'layout.js'
        	// parent: 'awy_blah' // basically saying this theme depends on parent theme, so load parent theme first
        	// area: 'awy_install' // either missing or matching the area where this theme is allowed
        }
    },
    observe: [
        //[ "Layout::hook:main", "awy_core_view_root.mainHook" ]
    ],
}
export default config;