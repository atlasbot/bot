const colors = require('colors');
const util = require('util');

colors.setTheme({
	log: 'grey',
	info: 'green',
	warn: 'yellow',
	debug: 'cyan',
	error: 'red',
});

class Logger {
	constructor(override) {
		if (override) {
			for (const prop of ['log', 'info', 'error', 'debug', 'warn']) {
				console[prop] = this[prop].bind(this);
			}
		}
	}

	/**
     * Log a regular message
     * @param {any} msg The (whatever) to log
     * @returns {void}
     */
	log(...args) {
		this._log(args, colors.log);
	}

	/**
     * Log a info message
     * @param {any} msg The (whatever) to log
     * @returns {void}
     */
	info(...args) {
		this._log(args, colors.info);
	}

	/**
     * Log a error message
     * @param {any} msg The (whatever) to log
     * @returns {void}
     */
	error(...args) {
		this._log(args, colors.error);
	}

	/**
     * Log a warn message
     * @param {any} msg The (whatever) to log
     * @returns {void}
     */
	warn(...args) {
		this._log(args, colors.warn);
	}

	/**
     * Log a debug message
     * @param {any} msg The (whatever) to log
     * @returns {void}
     */
	debug(...args) {
		this._log(args, colors.debug);
	}

	/**
     * Logs a message
     * @param {any} args An array of arguments to log
     * @param {function} color The function from Colors to use to format the message
     * @returns {void}
     * @private
     */
	_log(args, color = colors.log) {
		const msg = args.map((a) => {
			if (typeof a !== 'string') {
				return util.inspect(a);
			}

			return a;
		}).join(' ');
		const formatted = this._format(msg, color);

		return process.stdout.write(`${formatted}\n`);
	}

	/**
     * Formats a string to a loggable message, adding color and a timestamp.
     * @param {string} msg The message to format
     * @param {function} [color] The color function from Colors to format the message contents with
     * @returns {string} The string with all the fancy colors
     * @private
     */
	_format(msg, color) {
		const time = this._getTime();

		return `${time} ${color ? color(msg) : msg}`;
	}

	/**
     * Gets the time as HH:mm:ss
     * @param {boolean} color Whether or not to add color to the timestmap
     * @returns {string} the timestamp, with or without color depending on "color"
     */
	_getTime(color = true) {
		const date = new Date();

		let hour = date.getHours();
		hour = (hour < 10 ? '0' : '') + hour;

		let min = date.getMinutes();
		min = (min < 10 ? '0' : '') + min;

		let sec = date.getSeconds();
		sec = (sec < 10 ? '0' : '') + sec;

		const time = `${hour}:${min}:${sec}`;

		if (color) {
			return `${colors.white('[')}${colors.grey(time)}${colors.white(']')}`;
		}

		return `[${time}]`;
	}
}

module.exports = (new Logger(true));
