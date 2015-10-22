let config =  {
	name: 'Awy_Install',
	version: '0.0.0.2',
	description: "Install sequence extension",
	override: [
		['core/model/router','install/model/router']
	],
	routing: [
		['install/index/*','install/controller/index']
	],

}
export default config;