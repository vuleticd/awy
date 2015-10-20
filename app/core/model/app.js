import Logger from 'log/model/logger';
import Router from 'core/model/router';

export class App {
	constructor(message) {
      this.logger = Logger.getInstance('App');
      this.router = Router.getInstance();
      this.router.config({ mode: 'history'});
      this.isInitialized = false;
      this.host = null;
    }

	run() {
		this.router.listen();
	}
}