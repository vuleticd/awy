let config =  {
	module_name: 'awy_admin',
	version: '0.0.0.1',
	description: "Base Admin functionality",
	require: { module: { awy_core: '0.0.0.1' } },
    areas: {
            awy_admin: {
                views: {
                    root: { view_class: 'awy_core_view_root' },
                },
                auto_use: [ 'bootstrap', 'views' ],
                before_bootstrap: { callback: "awy_admin_admin.onBeforeBootstrap" },
            },
        },
	themes: { awy_admin_defaultTheme: {
				name: 'awy_admin_aefaultTheme',
                layout_before: 'admin/layout.yml',
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