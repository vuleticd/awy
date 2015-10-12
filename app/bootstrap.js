import {Util} from 'blah/util';
export class App {
    constructor(message) {
      this.message = message;
    }

    run() {
      var element = document.querySelector('#message');
      element.innerHTML = this.message;
      var u = new Util('log that');
    }
};

//export var app = bootstrap(App);
//app.run();