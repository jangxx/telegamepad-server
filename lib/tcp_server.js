const net = require("net");
const mergeOptions = require("merge-options");
const { GenericServer } = require('./generic_server');
const { messageParser } = require("./message_parser");

class TCPServer extends GenericServer {
    constructor(address, port, opts) {
        super();

        this._port = port;
        this._address = address;
        this._opts = mergeOptions({

        }, opts);

        this._server = null;
    }

    start() {

    }
}

module.exports = TCPServer;