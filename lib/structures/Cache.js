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

		// cacheman-redis doesn't like async, so this converts pretty much everything to async because async is life
		for (const key of ['del', 'set', 'get']) {
			const old = this[key];

			this[key] = promisify(old);
		}
	}
};
