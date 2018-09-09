const fs = require('fs').promises;
const path = require('path');

module.exports = {
	load: async (locale) => {
		if (locale) {
			return {
				base: require(path.join(__dirname, 'lang', locale, '/lang.json')),
			};
		}
		const locales = [];
		const lcs = await fs.readdir(path.join(__dirname, 'lang'));

		// includes "." is cheap but it should work fine for now
		for (const l of lcs.filter(f => !f.includes('.'))) {
			locales.push({
				base: require(path.join(__dirname, 'lang', l, '/lang.json')),
			});
		}

		return locales;
	},
};
