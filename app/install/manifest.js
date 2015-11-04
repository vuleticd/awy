let config =  {
	module_name: 'Awy_Install',
	version: '0.0.0.2',
	description: "Install sequence extension",
	require: { module: { Awy_Core: '0.0.0.1' } },
	override: [
		['Core_Model_Router','install/model/router']
	],
	routing: [
		['install/index/*','install/controller/index']
	],

}
export default config;