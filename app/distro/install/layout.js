let l =  {
	base: [
		{ view: 'head', do: [
			[ 'css' , 'css/normalize.css@awy_core', 'css/skeleton.css@awy_core'],
			[ 'css' , 'css/install.css@distro_install'],
		] }

	],
	"/": [
		{ include: 'base' },
		{ hook: 'main', views: 'index' }
	],
	"/s1": [
		{ include: 'base' },
		{ hook: 'main', views: 's1' }
	],
	"/s2": [
		{ include: 'base' },
		{ hook: 'main', views: 's2' }
	],
	"/s3": [
		{ include: 'base' },
		{ hook: 'main', views: 's3' }
	],
}
export default l;