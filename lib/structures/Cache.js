const Cacheman = require('cacheman-redis');
const { promisify } = require('util');

if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
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

		async has(id) {
			console.warn('Cache#has is deprecated.');

			return !!(await this.get(id));
		}
	};
} else {
	console.warn('Redis not configured, defaulting to maps.');
	// if redis isn't configured, maps are essentially a drop in replacement.
	// the only downside is that maps aren't persistent between restarts,
	// which is fine because we don't expect much consistency either way.
	module.exports = class extends Map {
		// prefix isn't needed because it's a map, but if it's forwarded to the map it throws a temper tantrum
		constructor() { // eslint-disable-line no-useless-constructor
			super();
		}

		// cacheman uses "del", maps have "delete", this just redirects it.
		del(...args) {
			return this.delete(...args);
		}

		// cachegoose has a third "ttl" option in seconds, this adds support for it
		set(key, value, ttl) {
			if (!ttl) {
				return super.set(key, value);
			}

			setTimeout(() => {
				this.del(key);
			}, ttl * 1000);

			return super.set(key, value);
		}

		has(id) {
			console.warn('Cache#has is deprecated.');

			return !!this.get(id);
		}
	};
}
