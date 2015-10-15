import Logger from 'log/model/logger';

export class App {
    constructor(message) {
      this.message = message;
      this.logger = Logger.getInstance('App');
    }

    run() {
      var element = document.querySelector('#message');
      element.innerHTML = this.message;
    }
};

//export var app = bootstrap(App);
//app.run();