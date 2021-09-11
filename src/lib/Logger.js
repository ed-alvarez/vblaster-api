const chalk = require('chalk');
const moment = require('moment-timezone');

const currentTime = moment().utc().format('MMM Do HH:mm:ss');
const callConsole = args => console.log.call(console, chalk.gray(currentTime), ...args);

const Logger = (type, ...messages) => {
	switch (type) {
		case 'success':
			callConsole([
				chalk.hex('#66BB6A')('[ OK ]'),
				'=>',
				...messages
			]);
			break;
		case 'debug':
			if (!process.env.CLI_DEBUG) return;

			callConsole([
				chalk.hex('#7E57C2')('[DEBUG]'),
				'=>',
				...messages
			]);
			break;
		case 'info':
			callConsole([
				chalk.hex('#42A5F5')('[INFO]'),
				'=>',
				...messages
			]);
			break;
		case 'error':
			callConsole([
				chalk.hex('#EF5350')('[ERROR]'),
				'=>',
				chalk.underline(...messages)
			]);
			break;
		case 'warn':
			callConsole([
				chalk.hex('#FFA726')('[WARN]'),
				'=>',
				chalk.underline(...messages)
			]);
			break;
		default:
			throw new Error(`Type ${type} not recognized by Logger.`);
	}
};

module.exports = Logger;
