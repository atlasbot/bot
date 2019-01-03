const TagError = require('../../TagError');

const prettyMs = require('../../../../lib/utils/prettyMs');
const parseBool = require('../../../../lib/utils/parseBool');
// parse all the things :D
const parseNumber = require('../../../../lib/utils/parseNumber');

module.exports = async (x, [n, verbose = 'true']) => {
	const ms = parseNumber(n);

	if (isNaN(ms)) {
		throw new TagError('"milliseconds" should be a number');
	}

	return prettyMs(ms, {
		verbose: parseBool(verbose),
	});
};

module.exports.info = {
	name: 'utils.prettyMs',
	args: '[milliseconds] <verbose=true>',
	description: 'Converts milliseconds to a pretty date. If verbose is true, it will use long names instead of short names, like "minutes" instead of "m".',
	examples: [{
		input: '{utils.prettyMs;133769}',
		output: '2 minutes 13 seconds',
	}, {
		input: '{utils.prettyMs;133769;false}',
		output: '2m 13s',
	}],
	dependencies: [],
};
