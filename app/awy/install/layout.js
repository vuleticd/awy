let layout =  {
	/*
	mixin OR route : [
		{
			if: "class_name.method" // apply this block only if this method return true
			hook: 'hook_name', views: 'view_name' // Add a view to a hook

		}
	]
	*/
	base: [
		//{ hook: 'head', views: 'head' },
		//{	view: 'head', do: [] }

	],
	"/": [
		{ include: 'base' },
		//{ hook: 'main', text: 'Blah Blah' }
		{ hook: 'main', views: 'index' }
	],
	"/step1": [
		{ include: 'base' },
		{ hook: 'main', views: 'step1' }
	],
	"/step2": [
		{ include: 'base' },
		{ hook: 'main', views: 'step2' }
	],
	"/step3": [
		{ include: 'base' },
		{ hook: 'main', views: 'step3' }
	]
}
export default layout;