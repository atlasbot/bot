const Cacheman = require('cacheman-redis');
const { promisify } = require('util');

module.exports = class extends Cacheman {
	constructor(prefix) {
		super({
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT),
			password: process.env.REDIS_PASS,
			prefix,
		});

		for (const key of ['del', 'set', 'get']) {
			const old = this[key];

			this[key] = promisify(old);
		}
	}
};
