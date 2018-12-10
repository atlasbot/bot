const timeFormat = require('../../../../lib/utils/timeFormat');

module.exports = (context, [exact = 'true', time]) => {
	const date = Date.parse(time) || Date.now();

	return timeFormat(date, exact === 'true');
};

module.exports.info = {
	name: 'utils.time',
	args: '<exact=true> <timestamp>',
	description: 'Formats the current/a date to a pretty timestamp.',
	examples: [{
		input: '{utils.time}',
		output: 'Dec 10, 2018, 4:08 PM',
	}, {
		input: '{utils.time;true;Mon, 10 Dec 2018 16:06:14 GMT}',
		output: 'Dec 10, 2018, 4:06 PM',
	}, {
		input: '{utils.time;false}',
		output: 'Dec 10, 2018',
	}],
	dependencies: [],
};
