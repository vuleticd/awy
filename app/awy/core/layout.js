let layout =  {
	/*
	mixin OR route : [
		{
			if: "class_name.method" // apply this block only if this method return true
			hook: 'hook_name', views: 'view_name' // Add a view to a hook
			view: 'view_name', do: [
				[ 'css' , 'path_from_module_root.css@module_name'], // add CSS file / link tag
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
}
export default layout;