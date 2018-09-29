const { wildcardToRegExp } = require('./../../lib/utils/wildcard');

module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Phrases',
			settingsKey: 'phrases',
		};
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
