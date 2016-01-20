let config =  {
	module_name: 'awy_core',
	version: '0.0.0.1',
    /*require: { module: { awy_admin: '0.0.0.1' } },*/
	description: "Base Awy classes and JS libraries",
    auto_use: [ 'layout', 'views' ],
    before_bootstrap: { callback: "awy_core_model_app.onBeforeBootstrap" },
    routing: [
            [ '/initialize.js', 'awy_core_controller_main.initialize_js' ],
            [ '/initialize.css', 'awy_core_controller_main.initialize_css' ]
    ],
    views: {
        head: { view_class: 'awy_core_view_head' },
        head_script: { view_class: 'awy_core_view_text' },
        head_css: { view_class: 'awy_core_view_text' },
        text: { view_class: 'awy_core_view_text' },
    },
    observe: [
       // [ "awy_oauth_provider_basev1::getAccessToken:after", "awy_admin_main.onOAuthAfterGetAccessToken" ]
    ],
	default_config: {
            /* DB config is processed before Modules, so it can't have default config override
            db/: {
                //host: 'https://localhost.firebaseio.com',
                //key: '123456',
                implicit_migration: true,
            },*/
            'db/implicit_migration': true,
            web: {
            },
            cookie: {
            },
            modules: {
                awy_core: {
                    company_name: 'Awy',
                    site_title: 'Awy',
                    copyright_message: 'Awy',
                    admin_email: 'admin@example.com',
                    support_name: 'Support',
                    support_email: 'support@example.com',
                    sales_name: 'Sales',
                    sales_email: 'support@example.com',
                    default_tz: "America/New_York",
                    default_country: 'US',
                    base_locale: 'en_US',
                    base_currency: 'USD',
                    default_currency: 'USD',
                },
            },
    },
}
export default config;