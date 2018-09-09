const url = require('url');

module.exports = (string) => {
	const result = url.parse(string, true);

	// If there is a hostname & protocol is http/https, return the url
	if (result.hostname && result.protocol && result.protocol.startsWith('http')) {
		return result;
	}
};
