let config =  {
	module_name: 'awy_install',
	version: '0.0.0.2',
	description: "Install sequence extension",
	require: { module: { awy_core: '0.0.0.1' } },
    /*load_after: ['awy_admin'],
    load_after: 'ALL',*/
	override: { class: [
			//['Core_Model_Router','Install_Model_Router'],
		],
	},
	routing: [
		['install/index/*','install/controller/index']
	],
	themes: { 
		awy_install: {
        layout_before: 'layout.yml',
        views_before: 'views' }
    },
}
export default config;