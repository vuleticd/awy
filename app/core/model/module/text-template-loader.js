import {TemplateRegistryEntry, Loader} from 'core/model/module/loader';
import {DOM} from 'core/model/dom-interface';

export class TextTemplateLoader {
  loadTemplate(loader: Loader, entry: TemplateRegistryEntry): Promise<any> {
    return loader.loadText(entry.address).then(text => {
      entry.setTemplate(DOM.createTemplateFromMarkup(text));
    });
  }
}