const Fuzzy = require('./structures/Fuzzy');
const lib = require('../lib');

module.exports = class Util {
	constructor(Atlas) {
		this.Atlas = Atlas || require('./../Atlas');
	}

	format(identifier, path, ...replacements) {
		const key = lib.utils.key(path);

		if (!this.Atlas.langs.has(identifier)) {
			throw new Error(`${identifier} is not a valid language.`);
		}

		if (Array.isArray(replacements[0]) && !replacements[1]) {
			// if the first replacement is an array, chances are the array contains actual replacements.
			// some legacy code still uses this way, so replace replacements with the first array
			[replacements] = replacements;
		}

		// merge english and the language it wants incase there are keys that haven't been localised yet
		const lang = { ...this.Atlas.langs.get('en-US'), ...this.Atlas.langs.get(identifier) };
		const val = lib.utils.getNested(lang, key);

		if (!val) {
			return;
		} if (typeof val !== 'string') {
			return val;
		}

		if (replacements[0]) {
			return val.replace(/\{([0-9]+)\}/ig, (match, p1) => {
				const i = Number(p1);
				if (replacements[i]) {
					return replacements[i];
				}

				return '';
			});
		}

		return val;
	}

	/**
	 * Find a member in the guild
	 * @param {Guild} guild the guild to get members from
	 * @param {string} query the query to use to find the member. Can be a user ID, username, nickname, mention, etc...
	 * @param {Object} opts options
	 * @param {Array} opts.members An optional members list to use
	 * @param {boolean} opts.memberOnly If false, the return value could be a member or a user object
	 * @param {number} opts.percent the percent of sensitivity, on a scale of 0 - 1, e.g 0.60 would require a 60% match
	 * @returns {Promise<Object|Null>} the member or nothing if nothing was found
	 */
	async findMember(guild, query, {
		matchPercent = 0.75,
		memberOnly = false,
		rest = true,
		members,
	} = {}) {
		if (!query.trim()) return;
		const id = query.trim().replace(/<|@|!|>/g, '');

		let guildMembers;
		if (members) {
			guildMembers = new Map();
			members.forEach(m => guildMembers.set(m.id, m));
		} else {
			if (!guild.members) {
				throw new Error('Util#findMember() was given a guild with no "members" array!');
			}
			guildMembers = guild.members; // eslint-disable-line prefer-destructuring
		}

		if (id && lib.utils.isSnowflake(id)) {
			const result = guildMembers.get(id) || this.Atlas.client.users.get(id);
			if (memberOnly || result) {
				return result;
			}
			if (rest) {
				try {
					try {
						const user = await this.Atlas.client.getRESTUser(id);
						if (user) {
							return user;
						}
					} catch (e) {
						console.warn(e);
					}
				} catch (e) {
					console.error(e);
				}
			}
		}

		return (new Fuzzy(members || Array.from(guildMembers.values()), {
			matchPercent,
			keys: [
				'id',
				'username',
				'nickname',
				'mention',
			],
		})).search(query);
	}
};
