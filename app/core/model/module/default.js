import {Origin} from 'core/model/origin';
import {TemplateRegistryEntry,Loader} from 'core/model/module/loader';
import {TextTemplateLoader} from 'core/model/module/text-template-loader';
import {PLATFORM} from 'core/model/platform-interface';

function ensureOriginOnExports(executed, name) {
  let target = executed;
  let key;
  let exportedValue;

  if (target.__useDefault) {
    target = target['default'];
  }

  Origin.set(target, new Origin(name, 'default'));

  for (key in target) {
    exportedValue = target[key];

    if (typeof exportedValue === 'function') {
      Origin.set(exportedValue, new Origin(name, key));
    }
  }

  return executed;
}

interface TemplateLoader {
  loadTemplate(loader: Loader, entry: TemplateRegistryEntry): Promise<any>;
}

export class DefaultLoader extends Loader {
  textPluginName: string = 'text';

  constructor() {
    
    super();
    this.moduleRegistry = {};
    this.useTemplateLoader(new TextTemplateLoader());

    let that = this;

    this.addPlugin('template-registry-entry', {
      'fetch': function(address) {
        let entry = that.getOrCreateTemplateRegistryEntry(address);
        return entry.templateIsLoaded ? entry : that.templateLoader.loadTemplate(that, entry).then(x => entry);
      }
    });
  }

  useTemplateLoader(templateLoader: TemplateLoader): void {
    this.templateLoader = templateLoader;
  }

  loadAllModules(ids: string[]): Promise<any[]> {
    let loads = [];

    for (let i = 0, ii = ids.length; i < ii; ++i) {
      loads.push(this.loadModule(ids[i]));
    }

    return Promise.all(loads);
  }

  loadTemplate(url: string): Promise<TemplateRegistryEntry> {
    return this._import(this.applyPluginToUrl(url, 'template-registry-entry'));
  }

  loadText(url: string): Promise<string> {
    return this._import(this.applyPluginToUrl(url, this.textPluginName));
  }
}

PLATFORM.Loader = DefaultLoader;

PLATFORM.eachModule = function(callback) {
  let modules = System._loader.modules;
  for (let key in modules) {
    if (callback(key, modules[key].module)) return;
  }
};

System.set('text', System.newModule({
  'translate': function(load) {
    return 'module.exports = "' + load.source
      .replace(/(["\\])/g, '\\$1')
      .replace(/[\f]/g, '\\f')
      .replace(/[\b]/g, '\\b')
      .replace(/[\n]/g, '\\n')
      .replace(/[\t]/g, '\\t')
      .replace(/[\r]/g, '\\r')
      .replace(/[\u2028]/g, '\\u2028')
      .replace(/[\u2029]/g, '\\u2029')
    + '";';
  }
}));

DefaultLoader.prototype._import = function(moduleId) {
  return System.import(moduleId);
};

DefaultLoader.prototype.loadModule = function(id) {
  let newId = System.normalize(id);
  let existing = this.moduleRegistry[newId];

  if (existing) {
    return Promise.resolve(existing);
  }

  return System.import(newId).then(m => {
    this.moduleRegistry[newId] = m;
    return ensureOriginOnExports(m, newId);
  });
};

DefaultLoader.prototype.map = function(id, source) {
  System.map[id] = source;
};

DefaultLoader.prototype.normalize = function(moduleId, relativeTo) {
  return System.normalize(moduleId, relativeTo);
};

DefaultLoader.prototype.applyPluginToUrl = function(url, pluginName) {
  return `${url}!${pluginName}`;
};

DefaultLoader.prototype.addPlugin = function(pluginName, implementation) {
  System.set(pluginName, System.newModule({
    'fetch': function(load, _fetch) {
      let result = implementation.fetch(load.address);
      return Promise.resolve(result).then(x => {
        load.metadata.result = x;
        return '';
      });
    },
    'instantiate': function(load) {
      return load.metadata.result;
    }
  }));
};
