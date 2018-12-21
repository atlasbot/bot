const isUri = require('../../../../lib/utils/isUri');

module.exports = async (x, [str, verify]) => !!isUri(str, verify === 'true');

module.exports.info = {
	name: 'utils.isUrl',
	args: '<string> <verify=false>',
	description: 'Returns true if <string> is a valid web URL, or false if it\'s anything else. If <verify=true> then the Atlas will perform a HEAD request and make sure the URL is "live".',
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
