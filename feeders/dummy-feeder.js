const GID = process.argv[2];
let opts = JSON.parse(process.argv[3]);

const log = console.log.bind(null, `[Gamepad ${GID}]`);
const { messageParser } = require("../lib/message_parser");

log(`Started dummy feeder with id ${GID}.`);

process.on("message", (msg, handle) => {
	const message = messageParser(msg);

	log(`Received message: key=${message.key}(${message.key.toString(16)}) value=${message.value}`);
});