let l =  {
    /* apply changes on global mixin */
	base: [
        /* append new custom view to footer */
		{ hook: 'footer', views: 'customblock' },
        /* append multiple new custom views to footer */
        //{ hook: 'footer', views: ['customblock', 'anotherview'] },
        /* replace all footer content with custom view */
        //{ hook: 'footer', clear: 'ALL', views: 'customblock' },
	],

    /* apply changes on single route/page layout */
    //"/": [
        /* append new custom view to footer */
        //{ hook: 'footer', views: 'customblock' },
        /* replace all footer content with custom view */
        //{ hook: 'footer', clear: 'ALL', views: 'customblock' },
    //],


	"/custompage": [
		{ include: 'base' },
		{ hook: 'main', views: 'custompage' }
	]
}
export default l;