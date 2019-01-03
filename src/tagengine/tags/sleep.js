const parseNumber = require('atlas-lib/lib/utils/parseNumber');
const TagError = require('./../TagError');

module.exports = (info, [timeout]) => {
	timeout = info.Atlas.lib.utils.parseNumber(timeout);

	if (isNaN(timeout)) {
		throw new TagError('"timeout" should be a valid number.');
	}

	if (timeout > 300) {
		throw new TagError('You cannot sleep for more than 5 minutes.');
	}

	timeout = parseNumber(timeout);

	return new Promise(resolve => setTimeout(resolve, timeout * 1000));
};

module.exports.info = {
	name: 'sleep',
	args: '[timeout]',
	description: 'Temporarily holds up processing. Tags before it will run normally, tags after it will have to wait. ',
	examples: [{
		input: '{channel.send;before the sleep} {sleep;10} {channel.send;yay im back}',
		output: 'before the sleep\n...\nyay im back',
		note: '"before the sleep" would be sent first, then 10 seconds later "yay im back" would follow. ',
	}],
	dependencies: [],
};
