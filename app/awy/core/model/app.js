class Core_Model_App extends Class {
	constructor() {
      super();
      this.logger = Class.i('awy_core_model_logger', 'App'); 
      this.isInitialized = false;
      this.host = null;
    }

	async run(area='frontend') {  
    try {
        let modReg = await this.init(area);
        let migrate = await modReg.bootstrap();
        console.log('migrate'); 
        let router = await Class.i('awy_core_model_router');
        console.log('router dispatch');
        console.log('router listen');
        let config = await Class.i('awy_core_model_config');
        console.log(config);
        router.listen();
    } catch(e) {
        try {
            let layout = await Class.i('awy_core_model_layout');
            let l = await layout.addView(
                'core/errors', 
                {template: '/app/awy/core/views/core/errors.html'}
              );
            l.rootView = 'core/errors';
            l.view('core/errors').set('errors', e);
            let response = await Class.i('awy_core_model_router_response');
            response.output();
            throw e;
        } catch(er) {
            (await this.logger).error(er);
        }
    }
	}

  /*
   * return Core_Model_Module_Registry instance
   */
  async init(area) {
    let config = await this.initConfig(area);
    let modReg = await this.initModules();
    let router = await Class.i('awy_core_model_router');
    (await this.logger).debug('initRouter');
    router.config({ mode: 'history'});
    return modReg;
  }

  /*
   * return Core_Model_Module_Registry instance
   */
  async initModules() {
    (await this.logger).debug('initModules');
    let config = await Class.i('awy_core_model_config');
    let req = await Class.i('awy_core_model_router_request');
    let moduleRegistry = await Class.i('awy_core_model_module_registry');
    let runLevels = {};

    let area = req.area;
    //runLevels['awy_core'] = 'REQUIRED';
    if (config.get('install_status') === 'installed') {
        runLevels[area] = 'REQUIRED';
    } else {
        config.set('module_run_levels', []);
        runLevels['awy_install'] = 'REQUIRED';
        area = 'awy_install';
        req.area = area;
    }

    //runLevels += (array)$config->get('module_run_levels/request') +
    //          (array)$config->get('module_run_levels/' . $area) +
    //          (array)$config->get('module_run_levels/FCom_Core');
    config.add({'module_run_levels': {'request': runLevels}});
    let modules = await moduleRegistry.scan();
    (await this.logger).debug('dbConfigFile localConfigFile');
    
    return modules;
  }

  /*
   * return Core_Model_Config instance
   */
  async initConfig(area) {
    (await this.logger).debug('initConfig');
    let config = await Class.i('awy_core_model_config');
    let req = await Class.i('awy_core_model_router_request');
    let localConfig = {};

    let rootDir = config.get('fs/root_dir');
    if (!rootDir) {
      rootDir =  req.scriptDir();
    }
    localConfig.fs = { root_dir: rootDir };
    (await this.logger).debug('ROOTDIR = ' + rootDir);

    let coreDir = config.get('fs/core_dir');
    if (!coreDir) {
        coreDir = '/app/awy/core';
        config.set('fs/core_dir', coreDir);
    }
    config.add(localConfig, true);
    // try to add from localStorage, 
    // if there's nothing there generate initial local storage config for core
    // later change it with
    //    config.set('install_status', 'installedYEP', false, true);
    //    config.writeLocalStorage('core');
    if (config.addFile('core', true) == null) {
      config.writeLocalStorage('core');
    }
    req.area = area;

    return config;
  }

  async onBeforeBootstrap() {
    //console.log('Core_Model_App.onBeforeBootstrap ');
    let layout = await Class.i('awy_core_model_layout');
    layout.defaultViewClass = 'awy_core_view_base';
    let req = await Class.i('awy_core_model_router_request');
    let area = req.area;
    let config = await Class.i('awy_core_model_config');
    ['cookie', 'web'].forEach(section => {
        let areaConfig = config.get(area +"/" + section);
        if (areaConfig) {
            config.set(section, areaConfig, true);
        }
    });
    //console.log(layout);
  }
}

export default Core_Model_App