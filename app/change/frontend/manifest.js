let c =  {
	module_name: 'change_frontend',
	version: '0.0.0.1',
	description: "Frontend changes demo",
	require: { module: { distro_frontend: '0.0.0.1' } },
    areas: {
            distro_frontend: {
                views: {
                    "custompage": {},
                    "customblock": { view_class: 'change_frontend_view_customblock' }
                },
                routing: [
                    [ '/custompage', 'change_frontend_controller.custompage' ]
                ],
            }
    },
	themes: { 
		distro_frontend_defaultTheme: {
            layout_before: 'layout.js',
        },
    },
}
export default c;