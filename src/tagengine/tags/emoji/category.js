const middleware = require('./middleware');

module.exports = middleware((x, [emoji]) => console.log(emoji) || emoji.category);

module.exports.info = {
	name: 'emoji.category',
	description: 'Gets an emoji\'s category name. **Does not support guild emojis**.',
	args: '<query>',
	examples: [{
		input: '{emoji.category;smile}',
		output: 'people',
	}],
	dependencies: [],
};
