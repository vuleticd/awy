import CoreView from 'awy/core/model/view.js';

class Step3View extends CoreView {
	constructor(params) {
		super();
		this._params = params;
	}

	async completeStep(){
		let config = await Class.i('awy_core_model_config');
		config.set('install_status', 'installed', false, true);
    	config.writeStorage('core');
    	await config.writeCoreConfig();

    	/*
		$runLevels = [];
        if (!empty($w['config']['run_levels_bundle'])) {
            switch ($w['config']['run_levels_bundle']) {
                case 'min':
                    $runLevels = [
                        'Sellvana_MarketClient' => 'REQUESTED',
                        'Sellvana_FrontendThemeBootSimple' => 'REQUESTED',
                    ];
                    break;

                case 'all':
                    $runLevels = [
                        'Sellvana_VirtPackCoreEcom' => 'REQUESTED',
                    ];
                    break;
            }
        }

        $this->BConfig->add([
            'install_status' => 'installed',
            'db' => ['implicit_migration' => 1],
            'module_run_levels' => ['FCom_Core' => $runLevels],
            'mode_by_ip' => [
                'FCom_Frontend' => !empty($w['config']['run_mode_frontend']) ? $w['config']['run_mode_frontend'] : 'DEBUG',
                'FCom_Admin' => !empty($w['config']['run_mode_admin']) ? $w['config']['run_mode_admin'] : 'DEBUG',
            ],
            'modules' => [
                'FCom_Frontend' => [
                    'theme' => 'Sellvana_FrontendThemeBootSimple',
                ],
            ],
            'cache' => [
                'default_backend' => $this->BCache->getFastestAvailableBackend(),
            ],
        ], true);

        $this->BConfig->writeConfigFiles();
    	*/
    	
		let r = await Class.i('awy_core_model_router');
        r.redirect('/admin');
	}
}

export default Step3View