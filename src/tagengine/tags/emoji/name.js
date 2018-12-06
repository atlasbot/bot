const middleware = require('./middleware');

module.exports = middleware((x, [emoji]) => emoji.name);

module.exports.info = {
	name: 'emoji.name',
	description: 'Gets the name of an emoji. Query can be an emoji name, the emoji itself or a keyword. **Does not support guild emojis**.',
	args: '<query>',
	examples: [{
		input: '{emoji.name;😄}',
		output: 'smile',
	}],
	dependencies: [],
};
