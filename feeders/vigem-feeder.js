const GID = process.argv[2];
let opts = JSON.parse(process.argv[3]);

const ViGEmClient = require("vigemclient");
const mergeOptions = require("merge-options");

const log = console.log.bind(null, `[Gamepad ${GID}]`);
const { messageParser } = require("../lib/message_parser");

opts = mergeOptions({
	// default options:
	vendorID: undefined,
    productID: undefined,
    debug: false,
	buttonMap: {
		0: "A",
		1: "B",
		2: "X",
		3: "Y",
		4: "START",
		5: "BACK",
		6: "LEFT_SHOULDER",
		7: "RIGHT_SHOULDER",
		// 8 is reserved for left trigger button
		// 9 is reserved for right trigger button
		10: "LEFT_THUMB",
		11: "RIGHT_THUMB",
		12: "GUIDE",
	},
	axisMap: {
		// 0x01XX are used for "real" axis
		0x0100: "leftX",
		0x0101: "leftY",
		0x0102: "rightX",
		0x0103: "rightY",
		0x0104: "dpadHorz",
		0x0105: "dpadVert",
		// 0x02XX are used for analog versions of the usually digital buttons
		0x0208: "leftTrigger",
		0x0209: "rightTrigger",
	},
}, opts);

log(`Started ViGEm feeder with id ${GID}.`);

const client = new ViGEmClient();
let err = client.connect();
if (err != null) {
	log("Error while connecting to ViGEmBus:", err.message);
	process.exit(1);
}

const controller = client.createX360Controller();
err = controller.connect();
if (err != null) {
	log("Error while connecting the controller:", err.message);
	process.exit(1);
} else {
	log(`Connected with internal index ${controller.index}`);
}

process.on("message", (msg, handle) => {
	const message = messageParser(msg);

    if (opts.debug) {
        log(`Received message: key=${message.key}(${message.key.toString(16)}) value=${message.value}`);
    }

	if (message.key in opts.buttonMap) {
		controller.buttons[opts.buttonMap[message.key]].setValue(message.value >= 0);
	}

	if (message.key in opts.axisMap) {
		const axis = controller.axis[opts.axisMap[message.key]];
		axis.setValue((message.value / 65536) * axis.maxValue);
	}
});