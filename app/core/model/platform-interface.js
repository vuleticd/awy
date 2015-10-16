interface Platform {
  global: Object;
  noop: Function;
  location: Object;
  history: Object;
  XMLHttpRequest: XMLHttpRequest;
  eachModule(callback: (key: string, value: Object) => boolean): void;
  addEventListener(eventName: string, callback: Function, capture: boolean): void;
  removeEventListener(eventName: string, callback: Function, capture: boolean): void;
}

export const PLATFORM: Platform = {
  noop: function() {},
  eachModule() {}
};

PLATFORM.global = (function() {
  // Workers don’t have `window`, only `self`
  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof global !== 'undefined') {
    return global;
  }

  // Not all environments allow eval and Function
  // Use only as a last resort:
  return new Function('return this')();
})();