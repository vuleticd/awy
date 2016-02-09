let c =  {
	module_name: 'distro_install',
	version: '0.0.0.2',
	description: "Install sequence extension",
	require: { module: { awy_core: '0.0.0.1', awy_admin: '0.0.0.1' } },
	areas: {
        distro_install: {
            views: {
                root: {  },
                index: { view_class: 'distro_install_view_index' },
                s1: { view_class: 'distro_install_view_s1'},
                s2: { view_class: 'distro_install_view_s2' },
                s3: { view_class: 'distro_install_view_s3' }
            }
        }
    },
    /*load_after: ['awy_admin'],
    load_after: 'ALL',
	Should make possible to call Class.i('test_class') and get instance of class from
	app/distro/install/lib/class.js file
	autoload: [
		['test','lib']
	],*/
	/*translations: {'en':'en.js'}, */
	routing: [
		['/','distro_install_controller.index'],
		['/install','distro_install_controller.index'],
		['/install/s1','distro_install_controller.s1'],
		['/install/s2','distro_install_controller.s2'],
		['/install/s3','distro_install_controller.s3']
	],
	/*default_config: {
            'modules/distro_install/something/else': 3,
    },*/
	themes: { 
		distro_install: {
        	layout_before: 'layout.js'
        	// parent: 'awy_blah' // basically saying this theme depends on parent theme, so load parent theme first
        	// area: 'distro_install' // either missing or matching the area where this theme is allowed
        }
    },
    observe: [
        //[ "Layout::hook:main", "awy_core_view_root.mainHook" ]
    ],
}
export default c;