const isUri = require('../../../lib/utils/isUri');

module.exports = async (x, [str]) => !!isUri(str);

module.exports.info = {
	name: 'isUrl',
	args: '<string>',
	description: 'Returns true if <string> is a valid web URL, or false if it\'s anything else.',
	examples: [{
		input: '{isUrl;https://atlasbot.xyz}',
		output: 'true',
	}, {
		input: '{isUrl;hahaepic}',
		output: 'false',
	}, {
		input: '{isUrl;}',
		output: 'false',
	}, {
		input: '{isUrl;protocol://example.com}',
		output: 'false',
	}],
	dependencies: [],
};
