let layout =  {
	base: [
		{ view: 'head', do: [
			[ 'css' , 'css/normalize.css@awy_core', 'css/skeleton.css@awy_core'],
			[ 'css' , 'css/admin.css@awy_admin'],
		] }

	],
	"/": [
		{ include: 'base' },
		{ hook: 'main', views: 'dashboard' }
	],
	"/login": [
		{ include: 'base' },
		{ hook: 'main', views: 'login' }
	],
	"/password/recover": [
		{ include: 'base' },
		{ hook: 'main', views: 'password/recover' }
	],
	"/migrate": [
		{ include: 'base' },
		{ hook: 'main', views: 'migrate' },
	]
}
export default layout;