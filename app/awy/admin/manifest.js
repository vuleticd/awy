let config =  {
	module_name: 'awy_admin',
	version: '0.0.0.1',
	description: "Base Admin functionality",
	require: { module: { awy_core: '0.0.0.1' } },
    /*migrate: 'awy_admin_instalacija',*/
    areas: {
            awy_admin: {
                views: {
                    root: { },
                    baseroot: { },
                    dashboard: { view_class: 'awy_admin_view_default' },
                    "admin/header": {},
                    "admin/nav": { view_class: 'awy_admin_view_nav' },
                    login: { view_class: 'awy_admin_view_login' },
                    "password/recover": { view_class: 'awy_admin_view_password' },
                    migrate: { view_class: 'awy_admin_view_migrate' },
                },
                routing: [
                    ['/admin/migrate','awy_admin_controller.migrate'],
                    ['/admin','awy_admin_controller.index'],
                    [ '/admin/logout', 'awy_admin_controller.logout' ], // replace by binded view helper function
                    ['/admin/password/recover','awy_admin_controller.password_recover'],
                ],
                auto_use: [ 'bootstrap' ],
                before_bootstrap: { callback: "awy_admin_admin.onBeforeBootstrap" },
            },
        },
	themes: { awy_admin_defaultTheme: {
				name: 'awy_admin_defaultTheme',
                layout_before: 'layout.js',
                area: 'awy_admin' },
            },
    default_config: {
            modules: {
                awy_admin: {
                    theme: 'awy_admin_defaultTheme',
                    default_locale: 'en_US',
                },
            },
    },
}
export default config;