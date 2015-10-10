export class App {
    constructor(message) {
      this.message = message;
    }

    run() {
      var element = document.querySelector('#message');
      element.innerHTML = this.message;
    }
};