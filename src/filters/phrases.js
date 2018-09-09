const wildcardRegex = require('./../util/wildcardRegex');

module.exports = class Spam {
	constructor(Atlas) {
		this.Atlas = Atlas;
		this.info = {
			name: 'Phrases',
			settingsKey: 'phrases',
		};
		this.alphaPhrases = [
			'test*phrase',
			'stp',
		];
	}

	execute(str) {
		const phrases = this.alphaPhrases.map(m => ({
			regex: wildcardRegex.wildcardToRegExp(m),
			raw: m,
		}));
		for (const phrase of phrases) {
			return phrase.regex.test(str);
		}
	}
};
