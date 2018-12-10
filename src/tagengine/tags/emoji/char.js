const middleware = require('./middleware');

module.exports = middleware((x, [emoji]) => emoji.char);

module.exports.info = {
	name: 'emoji.char',
	description: 'Gets an emoji character. **Does not support guild emojis**.',
	args: '<query>',
	examples: [{
		input: '{emoji.char;smile}',
		output: '😄',
	}],
	dependencies: [],
};
