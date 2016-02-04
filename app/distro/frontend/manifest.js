let c =  {
	module_name: 'distro_frontend',
	version: '0.0.0.1',
	description: "Base Frontend functionality",
	require: { module: { awy_core: '0.0.0.1' } },
    areas: {
            distro_frontend: {
                views: {
                    "root": { view_class: 'distro_frontend_view_root' },
                    "index": {},
                    "header": {},
                    "footer": {}
                },
                routing: [
                    [ '/', 'distro_frontend_controller.index' ]
                ],
                auto_use: [ 'bootstrap']
            }
    },
	themes: { distro_frontend_defaultTheme: {
				name: 'Default Frontend Theme',
                layout_before: 'layout.js',
                area: 'distro_frontend' },
            },
    default_config: {
            modules: {
                distro_frontend: {
                    theme: 'distro_frontend_defaultTheme',
                    default_locale: 'en_US',
                    // nav_top: { root_cms: 1, root_category: 1, type: categories_root }
                },
            },
    },
}
export default c;