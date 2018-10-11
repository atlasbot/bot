/**
 * Formats a short language key into the full key. E.g, "help" => "commands.help", "general.help" => "general.help"
 * @param {string} key The language key.
 * @returns {string} The formatted key
 */
module.exports = (key) => {
	const safe = ['locale', 'general', 'info', 'commands'];
	if (safe.some(s => key.startsWith(s))) {
		return key;
	}

	return `commands.${key}`;
};
