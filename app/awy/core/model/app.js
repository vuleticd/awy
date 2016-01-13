class Core_Model_App extends Class {
	constructor() {
      super();
      this.logger = Class.i('awy_core_model_logger', 'App'); 
      this.isInitialized = false;
      this.host = null;
      this._baseUrl = null;
    }

	async run(area='frontend') {  
    try {
        let modReg = await this.init(area);
        let migrate = await modReg.bootstrap();
        let migri = await Class.i('awy_core_model_migrate');
        await migri.migrateModules(true);
        console.log('migrate'); 
        let router = await Class.i('awy_core_model_router');
        console.log('router listen');
        router.listen();

        let config = await Class.i('awy_core_model_config');
        let layout = await Class.i('awy_core_model_layout');
        console.log(config);
        console.log(router);
        console.log(layout);
        //setTimeout(router.navigate('install/step1'), 10000);
        //router.navigate('install/step1');
    } catch(e) {
        try {
            let layout = await Class.i('awy_core_model_layout');
            let l = await layout.addView(
                'core/errors', 
                {template: 'awy/core/views/core/errors'}
              );
            l.rootView = 'core/errors';
            l.view('core/errors').set('errors', e);
            let response = await Class.i('awy_core_model_router_response');
            await response.output();
            /* Demonstration of how error can change and be displayed after the load
            setInterval(async () => {
              let layout = await Class.i('awy_core_model_layout');
              let erV = layout.view('core/errors');
              let e = new Error('tttt');
              erV.set('errors', e);
              console.log(erV);
            }, 1000);
            */
            //throw e;
        } catch(er) {
            //(await this.logger).error(er);
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

    (await this.logger).debug('DB HOST CONFIG START');
    await config.initDbHost();
    (await this.logger).debug('DB URL: ' + config.get('db/host'));
    console.log('AFTER DB HOST CONFIG', JSON.parse(JSON.stringify(config)), JSON.parse(JSON.stringify(localStorage)));
    
    // INIT USER TOKEN HERE

    (await this.logger).debug('CORE CONFIG START');
    await config.initCoreConfiguration();
    console.log('AFTER DB HOST CONFIG', JSON.parse(JSON.stringify(config)), JSON.parse(JSON.stringify(localStorage)));
    req.area = area;

    return config;
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
    (await this.logger).debug('localConfigFile');

    return modules;
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

  baseUrl() {
      if (!this._baseUrl){
        this._baseUrl = window.location.protocol + "//" + window.location.hostname + "/";
      }
      return this._baseUrl;
  }

  href(url = '') {
      return this.baseUrl() + url;
  }
}

export default Core_Model_App