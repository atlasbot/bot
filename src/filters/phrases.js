const { wildcardToRegExp } = require('./../../lib/utils/wildcard');

module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	execute(str, msg, filterConfig) {
		const phrases = filterConfig.list.map(m => ({
			regex: wildcardToRegExp(m),
			raw: m,
		}));
		for (const phrase of phrases) {
			return phrase.regex.test(str);
		}
	}
};

module.exports.info = {
	name: 'Phrases',
	settingsKey: 'phrases',
};
