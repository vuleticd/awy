import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract.js';

class Awy_Install_Controller extends Awy_Core_Controller_Abstract {
	constructor() {
		super();
	}

	async onBeforeDispatch(){
        if (!super.onBeforeDispatch()) { 
        	return false;
        }
        let req = await Class.i('awy_core_model_router_request');
        let method = 'GET';//req.method();
        switch(method){
        	case 'GET':
        		let layout = await Class.i('awy_core_model_layout');
        		await layout.applyTheme('awy_install');
        		break;
        	case 'POST':
        		/*
        		$sData =& $this->BSession->dataToUpdate();
            	$w = $this->BRequest->post('w');
            	$sData['w'] = !empty($sData['w']) ? $this->BUtil->arrayMerge($sData['w'], $w) : $w;
            	*/
        		break;
        }
        console.log('Awy_Install_Controller.onBeforeDispatch');
        return true;
    }

    async onAfterDispatch() {
        await super.onAfterDispatch();
        // debug
        let enevts = await Class.i('awy_core_model_events');
        for (var [key, value] of enevts._events) {
            console.log("EVENT: " + key);
            console.log(value.observers || null);
        }
    }

    async action_index(){
    	console.log('Awy_Install_Controller.action_index');
    	let layout = await Class.i('awy_core_model_layout');
    	await layout.applyLayout('/');
    }

    async action_step1() {
        console.log('Awy_Install_Controller.action_step1');
        let layout = await Class.i('awy_core_model_layout');
        await layout.applyLayout('/step1');
    }

    async action_step2() {
        console.log('Awy_Install_Controller.action_step2');
        let layout = await Class.i('awy_core_model_layout');
        await layout.applyLayout('/step2');
    }

    async action_step3() {
        console.log('Awy_Install_Controller.action_step3');
        let layout = await Class.i('awy_core_model_layout');
        await layout.applyLayout('/step3');
    }
}

export default Awy_Install_Controller