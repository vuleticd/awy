class Awy_Admin_Admin extends Class {
	constructor(){
		super();
	}

	async onBeforeBootstrap(){
		let config = await Class.i('awy_core_model_config');
		let defTheme = config.get('modules/awy_admin/theme');
		let layout = await Class.i('awy_core_model_layout');
		layout.defaultTheme = defTheme || 'awy_admin_defaultTheme';
		layout.defaultViewClass = 'awy_admin_view_default';
	}

	bootstrap() {
		console.log('Awy_Admin_Admin.bootstrap exec');
		/*
		$this->FCom_Admin_Main->bootstrap();

        if ($this->BRequest->https() && $this->BConfig->get('web/hsts_enable')) {
            $this->BResponse->httpSTS();
        }

        $this->BResponse->nocache();
        //$this->BConfig->set('web/hide_script_name', 0);

        $this->FCom_Admin_Controller_MediaLibrary
            ->allowFolder('media/images') // for wysiwyg uploads
        ;
        */
	}
}
export default Awy_Admin_Admin;
