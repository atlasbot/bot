const middleware = require('./middleware');
const timeFormat = require('../../../../lib/utils/timeFormat');

module.exports = middleware(({ channel }, [exact]) => timeFormat(channel.createdAt, exact === 'true'), 1);

module.exports.info = {
	name: 'channel.createdAt',
	description: 'Returns the date the channel was created. "exact" is a true/false value on whether to include hours/minutes.',
	args: '<exact> <channel>',
	examples: [{
		input: '{channel.createdAt;general}',
		output: 'Jul 31, 2018',
	}, {
		input: '{channel.createdAt;general;true}',
		output: 'Jul 31, 2018, 9:19 PM',
	}],
	dependencies: ['channel'],
};
