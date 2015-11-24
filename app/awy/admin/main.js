class Awy_Admin_Main extends Class {
	constructor(){
		super();
	}

	bootstrap() {
		console.log('Awy_Admin_Main.bootstrap exec');
		/*
		$this->FCom_Admin_Model_User;

        $locale = BLocale::i();
        $this->FCom_Admin_Model_Role->createPermission([
            'system' => $locale->_('System'),
            'system/users' => $locale->_('Manage Users'),
            'system/roles' => $locale->_('Manage Roles and Permissions'),
            'system/settings' => $locale->_('Update Settings'),
            'system/modules' => $locale->_('Manage Modules'),
            'system/templates' => $locale->_('Edit System Templates'),
            'system/backups' => $locale->_('System Backups'),
            'system/importexport' => $locale->_('Import Export'),
            'settings/FCom_Admin' => $locale->_('Admin Settings'),
            'settings/FCom_Core' => $locale->_('Core Settings'),
            'settings/FCom_Frontend' => $locale->_('Frontend Settings'),
            'settings/FCom_FrontendTheme' => $locale->_('Frontend Theme Settings'),
        ]);
		*/
	}
}
export default Awy_Admin_Main;
