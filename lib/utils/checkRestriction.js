/**
 * Checks a restriction against roles, channels, etc.. and returns a key like "blacklist.channel"
 * @param {Object} data Data the user has
 * @param {Array<string>} data.roles An array of role ID's the user has
 * @param {string} data.channel The channel the restriction is in
 * @param {Object} restriction The restriction to check <data> against
 * @param {string} restriction.mode The restriction mode, "blacklist" or "whitelist"
 * @param {Array<string>} restriction.roles Restricted roles
 * @param {Array<string>} restriction.channels Restricted channels
 * @returns {string|void} If undefined, everything is gucci
 */
module.exports = (data, { mode, roles, channels }) => {
	if (mode === 'blacklist') {
		if (channels.includes(data.channel)) {
			// user is in a blacklisted channel
			return 'blacklist.channel';
		}

		if (roles.some(id => data.roles.includes(id))) {
			// user has a blacklisted role
			return 'blacklist.role';
		}
	} else {
		if (channels.length && !channels.includes(data.channel)) {
			// user is not in a whitelisted channel
			return 'whitelist.channel';
		}

		if (roles.length && !roles.some(id => data.roles.includes(id))) {
			// user does not have a whitelisted role
			return 'whitelist.role';
		}
	}
};
