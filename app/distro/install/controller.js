import Abstract from 'awy/core/controller/abstract.js';

class InstallController extends Abstract {
	constructor() {
		super();
	}

	async onBeforeDispatch(){
        if (!super.onBeforeDispatch()) { 
        	return false;
        }
        let req = await Class.i('awy_core_model_router_request');
		let l = await Class.i('awy_core_model_layout');
		await l.applyTheme('distro_install');
        return true;
    }

    async onAfterDispatch() {
        await super.onAfterDispatch();
        // debug only, should prevent the load in production case, somehow
        let e = await Class.i('awy_core_model_events');
        for (var [key, value] of e._events) {
            (await e.logger).debug("EVENT: " + key);
            (await e.logger).debug("OBSERVERS: " + JSON.stringify(value.observers));
        }
    }

    async action_index(){
    	let l = await Class.i('awy_core_model_layout');
    	await l.applyLayout('/');
    }

    async action_s1() {
        let l = await Class.i('awy_core_model_layout');
        await l.applyLayout('/s1');
    }

    async action_s2() {
        let l = await Class.i('awy_core_model_layout');
        await l.applyLayout('/s2');
    }

    async action_s3() {
        let l = await Class.i('awy_core_model_layout');
        await l.applyLayout('/s3');
    }
}

export default InstallController