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
		{ view: 'head', do: [
			[ 'css' , 'css/normalize.css@awy_core', 'css/skeleton.css@awy_core'],
			[ 'css_raw', 'media=screen','title=awy_style'],
			[ 'css_rule', 'awy_style','div.panel','text-align: center;']
		] }

	],
	"/": [
		{ include: 'base' },
		//{ hook: 'main', text: 'Blah Blah' }
		{ hook: 'main', views: 'index' },
		/*{ view: 'root', set: { 
			body_class: ['install','index']
		}},*/
	],
	"/step1": [
		{ include: 'base' },
		{ hook: 'main', views: 'step1' },
		/*{ view: 'step1', set: { 
			db_url: 'https://torrid-heat-5927.firebaseio.com',
			db_key: 'HkAgAjx75eRzC4sLqzV1HVw4rPmEFqqcTQcUSAt0'
		}},
		{ 
			view: 'root', 
			set: { 
				body_class: ['install','step1']
			},
			param: {
				x: 'y'
			}
		},*/
	],
	"/step2": [
		{ include: 'base' },
		{ hook: 'main', views: 'step2' },
		/*{ view: 'root', set: { 
			body_class: ['install','step2']
		}},*/
	],
	"/step3": [
		{ include: 'base' },
		{ hook: 'main', views: 'step3' },
		/*{ view: 'root', set: { 
			body_class: ['install','step3']
		}},*/
	]
}
export default layout;