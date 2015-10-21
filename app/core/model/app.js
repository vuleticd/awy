import Logger from 'log/model/logger';
import Router from 'core/model/router';

export class App {
	constructor() {
      this.logger = Logger.getInstance('App');
      this.router = Router.getInstance();
      this.router.config({ mode: 'history'});
      this.isInitialized = false;
      this.host = null;
    }

	run() {
    //this.logger.info(System.loads);
		this.router.listen();
	}
}