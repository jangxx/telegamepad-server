const dgram = require("dgram");
const mergeOptions = require("merge-options");
const { GenericServer } = require('./generic_server');
const { messageParser } = require("./message_parser");

class UDPServer extends GenericServer {
    constructor(address, port, opts) {
        super();

        this._port = port;
        this._address = address;
        this._opts = mergeOptions({
            type: "udp4",
            reuseAddr: false,
        }, opts);

        this._server = null;
        this._logPrefix = "UDP Server";
    }

    start() {
        if (this._server != null) {
            this._server.close();
        }

        this._server = dgram.createSocket(this._opts);

        this._server.on("message", msg_raw => {
            const message = messageParser(msg_raw);

            if (message != null) {
                this.emit("input", message);
            }
        });

        return new Promise(resolve => {
            this._server.bind(this._port, this._address, resolve);
            this._log(`Server is listening on ${this._address}:${this._port}`);
        });
    }
}

module.exports = UDPServer;