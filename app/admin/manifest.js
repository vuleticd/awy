let config =  {
	module_name: 'Awy_Admin',
	version: '0.0.0.1',
	description: "Base Admin functionality",
	require: { module: { Awy_Core: '0.0.0.1' } },
	
	themes: { FCom_Admin_DefaultTheme: {
				name: 'FCom_Admin_DefaultTheme',
                layout_before: 'Admin/layout.yml',
                area: 'FCom_Admin' },
            },
    default_config: {
            modules: {
                admin: {
                    theme: 'FCom_Admin_DefaultTheme',
                    default_locale: 'en_US',
                },
            },
    },
}
export default config;