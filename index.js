const packageJson = require("./package.json");
const defaultConfig = require("./default_config.json");

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

const { program } = require("commander");
const mergeOptions = require("merge-options");

const UDPServer = require("./lib/udp_server");
const TCPServer = require("./lib/tcp_server");

program
    .version(packageJson.version)
    .option("--show-configs", "Show existing configurations and exit", false)
    .option("--config-file [file.json]", "JSON file which contains the configurations. Will be created if it doesn't exist (Default: config.json)", "config.json")
    .option("-C, --configuration <name>", "Configuration to load from the configuration file (Default: 'default')", "default")
    .parse(process.argv);

if (!fs.existsSync(program.configFile)) {
    fs.copyFileSync("default_config.json", program.configFile, fs.constants.COPYFILE_EXCL);
    console.log(`Created new config file "${path.resolve(program.configFile)}".`);
    process.exit(1);
}

// read config file
let configFile;
try {
    let file_content = fs.readFileSync(program.configFile, "utf8");
    configFile = JSON.parse(file_content);
} catch(e) {
    console.log("Error while reading config file:", e.message);
    process.exit(1);
}

if (!("configurations" in configFile)) {
    console.log("The config file does not contain any configurations.");
    process.exit(0);
}

if (!(program.configuration in configFile.configurations)) {
    console.log(`The specified configuration "${program.configuration}" does not exist in the config file.`);
    process.exit(1);
}

const configuration = configFile.configurations[program.configuration];
const options = mergeOptions(defaultConfig.options, configFile.options);

if (!("gamepads" in configuration)) {
    console.log(`The specified configuration is invalid ("gamepads" array is missing).`);
    process.exit(1);
}

console.log(`The specified configuration contains ${configuration.gamepads.length} gamepad${configuration.gamepads.length != 1 ? "s" : ""}.`);
if (configuration.gamepads.length == 0) {
    process.exit(0);
}

// create server
if (!["udp", "tcp"].includes(options.server)) {
    console.log(`Invalid server "${options.server}" (Must be "udp" or "tcp").`);
    process.exit(1);
}

let server;
switch (options.server) {
    case "udp":
        server = new UDPServer(options.server_address, options.server_port, options.server_options);
        break;
    case "tcp":
        server = new TCPServer(options.server_address, options.server_port, options.server_options);
        break;
}

// create feeder processes
const feeders = {};

for (let gamepad_config of configuration.gamepads) {
    if (!("id" in gamepad_config) || !("feeder" in gamepad_config)) {
        console.log("Incomplete gamepad definition, skipping.");
        continue;
    }

    let moduleName = null;
    switch (gamepad_config.feeder) {
        case "vjoy":
            moduleName = "./feeders/vjoy-feeder.js";
            break;
        case "vigem":
            moduleName = "./feeders/vigem-feeder.js";
            break;
        case "dummy":
            moduleName = "./feeders/dummy-feeder.js";
            break;
        default:
            console.log(`Invalid feeder "${gamepad_config.feeder}", skipping.`);
            break;
    }

    if (moduleName == null) continue;

    const subproc = child_process.fork(moduleName, [
        String(gamepad_config.id),
        gamepad_config.options ? JSON.stringify(gamepad_config.options) : "{}",
    ]);

    feeders[gamepad_config.id] = subproc;
}

// start server
server.on("input", input => {

});

server.start();