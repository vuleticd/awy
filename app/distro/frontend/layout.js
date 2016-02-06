let l =  {
	base: [
		{ view: 'head', do: [
			[ 'css' , 'css/normalize.css@awy_core', 'css/skeleton.css@awy_core'],
			[ 'css' , 'css/bootstrap.css@distro_frontend'],
		] },
		{ hook: 'before_body_end', views: 'bottom_scripts' },
		{ hook: 'header', views: 'header' },
		{ hook: 'footer', views: 'footer' }
	],
	"/": [
		{ include: 'base' },
		{ hook: 'main', views: 'index' }
	],
	"404": [
    	{ include: 'base' },
    	{ hook: 'main', views: '404' }
    ],
}
export default l;