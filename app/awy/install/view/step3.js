import Awy_Core_Model_View from 'awy/core/model/view.js';

class Awy_Install_View_Step3 extends Awy_Core_Model_View {
	constructor(params) {
		super();
		this._params = params;
	}

	async completeStep(){

		alert(JSON.stringify(this, null, 4));
		let config = await Class.i('awy_core_model_config');
		config.set('install_status', 'installed', false, true);
    	config.writeLocalStorage('core');
    	await config.writeCoreConfig('core');

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
    	window.location.href = '/';
		//let r = await Class.i('awy_core_model_router');
        //r.navigate('/');
	}
}

export default Awy_Install_View_Step3