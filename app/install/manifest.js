let config =  {
	module_name: 'Awy_Install',
	version: '0.0.0.2',
	description: "Install sequence extension",
	require: { module: { Awy_Core: '0.0.0.1' } },
	override: { class: [
			['Core_Model_Router','Install_Model_Router'],
		],
	},
	routing: [
		['install/index/*','install/controller/index']
	],
	themes: { FCom_Install: {
                layout_before: 'layout.yml',
                views_before: 'views' }
            }

}
export default config;