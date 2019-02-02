const discordCodes = require('../data/discordCodes.json');

module.exports = class TagError extends Error {
	constructor(raw, {
		docRef,
	} = {}) {
		if (typeof raw !== 'string') {
			// eris Discord(REST|HTTP)Error special handling
			if (raw.constructor && raw.constructor.name.includes('Discord')) {
				raw = `${discordCodes[raw.code]} (${raw.constructor.name}/${raw.code})`;
			}
		}

		super(raw);

		this.docRef = docRef;
	}
};
