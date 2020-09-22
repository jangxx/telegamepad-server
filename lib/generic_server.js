const { EventEmitter } = require("events");

class GenericServer extends EventEmitter {
    constructor() {
        super();

        this._logPrefix = "GenericServer";
    }

    get _log() {
        return console.log.bind(null, `[${this._logPrefix}]`);
    }

    start() {
        return Promise.reject();
    }
}

module.exports = { GenericServer };