let layout =  {
	/*
	mixin OR route : [
		{
			if: "class_name.method" // apply this block only if this method return true
			hook: 'hook_name', views: 'view_name' // Add a view to a hook
			view: 'view_name', do: [
				[ 'css_raw', 'media=screen','title=awy_style'], // add blank and named style tag
				[ 'css_rule', 'awy_style','.container','left: 50%;'] // add css rule to named style tag
			], set: {
				X: 'Y' // <==> VIEW_CLASS._params['args']['X'] = 'Y'
			}, param: {
				X: 'Y' // <==> VIEW_CLASS._params['X'] = 'Y'
			}

		}
	]
	*/
	base: [
		{ view: 'head', do: [
			[ 'css' , 'css/normalize.css@awy_core', 'css/skeleton.css@awy_core'],
			[ 'css' , 'css/install.css@awy_install'],
		] }

	],
	"/": [
		{ include: 'base' },
		//{ hook: 'main', text: 'Blah Blah' }
		{ hook: 'main', views: 'index' },
	],
	"/step1": [
		{ include: 'base' },
		{ hook: 'main', views: 'step1' },
	],
	"/step2": [
		{ include: 'base' },
		{ hook: 'main', views: 'step2' },
	],
	"/step3": [
		{ include: 'base' },
		{ hook: 'main', views: 'step3' },
	],
}
export default layout;