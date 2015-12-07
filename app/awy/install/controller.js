import Awy_Core_Controller_Abstract from 'awy/core/controller/abstract';

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

    async action_index(){
    	console.log('Awy_Install_Controller.action_index');
    	let layout = await Class.i('awy_core_model_layout');
    	await layout.applyLayout('/');
    }
}

export default Awy_Install_Controller