module.exports.wildcardToRegExp = s => new RegExp(`^${s.split(/\*+/).map(module.exports.regExpEscape).join('.*')}$`);

module.exports.regExpEscape = s => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

module.exports.match = (pattern, str) => {
	const regex = module.exports.wildcardToRegExp(pattern);

	return regex.exec(str);
};
