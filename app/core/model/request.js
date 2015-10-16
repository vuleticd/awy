import Logger from 'log/model/logger';

export class Request {
    constructor() {
        this.params = [];
        this.postTagsWhitelist = [];
        this.area = null;
        this.logger = Logger.getInstance('request');
    }
}