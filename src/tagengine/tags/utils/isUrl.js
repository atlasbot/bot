const isUri = require('../../../../lib/utils/isUri');

module.exports = async (x, [str]) => !!isUri(str);

module.exports.info = {
	name: 'utils.isUrl',
	args: '<string>',
	description: 'Returns true if <string> is a valid web URL, or false if it\'s anything else.',
	examples: [{
		input: '{utils.isUrl;https://atlasbot.xyz}',
		output: 'true',
	}, {
		input: '{utils.isUrl;hahaepic}',
		output: 'false',
	}, {
		input: '{utils.isUrl;}',
		output: 'false',
	}, {
		input: '{utils.isUrl;protocol://example.com}',
		output: 'false',
	}],
	dependencies: [],
};
