let l =  {
    /* apply changes on global mixin */
	base: [
        /* append new custom view to footer */
		{ hook: 'footer', views: 'customblock' },
        /* append multiple new custom views to footer */
        //{ hook: 'footer', views: ['customblock', 'anotherview'] },
        /* replace all footer content with custom view */
        //{ hook: 'footer', clear: 'ALL', views: 'customblock' },
        /* remove only footer view and add customblock view */
        //{ hook: 'footer', clear: 'footer', views: 'customblock' },
        /* remove multiple views and add customblock view */
        //{ hook: 'footer', clear: ['footer', 'view2'], views: 'customblock' },
	],

    /* apply changes on single route/page layout */
    //"/": [
        /* append new custom view to footer */
        //{ hook: 'footer', views: 'customblock' },
        /* replace all footer content with custom view */
        //{ hook: 'footer', clear: 'ALL', views: 'customblock' },
    //],
/*
    "/": [
        { hook: 'main', clear: 'index', views: 'custompage' }
    ],
    */
	"/custompage": [
		{ include: 'base' },
        { hook: 'footer', clear: 'footer' },
		{ hook: 'main', views: 'custompage' }
	]
}
export default l;