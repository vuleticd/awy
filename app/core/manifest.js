let config =  {
	module_name: 'Awy_Core',
	version: '0.0.0.1',
	description: "Base Awy classes and JS libraries",
	default_config: {
            db: {
                dbname: 'awy',
                username: 'root',
                logging: true,
                implicit_migration: true,
            },
            web: {
            },
            cookie: {
            },
            modules: {
                core: {
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