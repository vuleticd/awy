let layout =  {
	base: [
		{ root: 'root' },
		{ hook: 'header', views: 'admin/header' },
		{ hook: 'site_main', views: 'admin/nav' },
		{ view: 'head', do: [
			[ 'css' , 'css/normalize.css@awy_core', 'css/skeleton.css@awy_core'],
			[ 'css' , 'css/admin.css@awy_admin'],
		] },
		{ view: 'admin/nav', do: [
			[ 'addNav' , {dashboard: { label: 'Dashboard', href: '/', pos: 10, icon_class: 'icon-dashboard' }}],
			[ 'addNav', {system: { label: 'System', pos: 900, icon_class: 'icon-cog' }} ],
           	[ 'addNav', {system: { users: { label: 'Users', href: '/users'  }}} ],
           	//[ 'addNav', {system: { roles: { label: 'Roles', href: '/roles'  }}} ],
            //[ 'addNav', {system: { users: { blah: { label: 'blah', href: '/users/blah'  }}}} ],
            //[ 'removeNav', 'system' ],
            [ 'addNav', {modules: { label: 'Modules', pos: 800  }} ],
		] }

	],
	"/": [
		{ include: 'base' },
		{ hook: 'main', views: 'dashboard' }
	],
	"/login": [
		{ include: 'base' },
		{ root: 'baseroot' },
		{ hook: 'main', views: 'login' }
	],
	"/password/recover": [
		{ include: 'base' },
		{ root: 'baseroot' },
		{ hook: 'main', views: 'password/recover' }
	],
	"/migrate": [
		{ include: 'base' },
		{ root: 'baseroot' },
		{ hook: 'main', views: 'migrate' },
	]
}
export default layout;