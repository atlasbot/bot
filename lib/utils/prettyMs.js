const parseMs = require('./parseMs');

const map = {
	days: 'd',
	hours: 'h',
	minutes: 'm',
	seconds: 's',
};

/**
 * Formats milliseconds to a time (1337 > 1.3 seconds)
 * @param {number} ms The milliseconds
 * @param {Object} opts options
 * @param {boolean} [opts.verbose=true] If false, output will be short (e.g, 1337 > 1.3s), if true output will be verbose (1337 > 1.3 seconds) :^)
 * @returns {string}
 */
module.exports = (ms, {
	verbose = true,
} = {}) => {
	if (ms === 0) {
		return 'now';
	}

	if (!Number.isFinite(ms)) {
		throw new TypeError('Expected a finite number');
	}

	const chunks = [];

	const add = (val, key) => {
		if (val !== 0) {
			const short = map[key];

			if (short) {
				if (verbose) {
					const text = `${val} ${key.substring(0, key.length - 1)}`;

					return chunks.push(val !== 1 ? `${text}s` : text);
				}

				return chunks.push(val + short);
			}
		}
	};

	const parsed = parseMs(ms);

	for (const key of Object.keys(parsed)) {
		add(parsed[key], key);
	}

	return chunks[0] && chunks.join(' ');
};
