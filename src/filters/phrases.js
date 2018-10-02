const { wildcardToRegExp } = require('./../../lib/utils/wildcard');
const Filter = require('./../structures/Filter');

module.exports = class Phrases extends Filter {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
		this.Atlas = Atlas;
	}

	execute(str, msg, {
		filterConfig,
	}) {
		const phrases = filterConfig.list.map(m => ({
			regex: wildcardToRegExp(`*${m}*`),
			raw: m,
		}));
		for (const phrase of phrases) {
			if (phrase.regex.test(str)) {
				return phrase.raw;
			}
		}
	}
};

module.exports.info = {
	name: 'Phrases',
	settingsKey: 'phrases',
};
