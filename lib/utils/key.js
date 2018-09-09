module.exports = (key) => {
	const safe = ['locale', 'general', 'info', 'commands'];
	if (safe.some(s => key.startsWith(s))) {
		return key;
	}

	return `commands.${key}`;
};
