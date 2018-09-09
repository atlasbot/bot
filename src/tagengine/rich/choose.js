const Tag = require('../Tag');
const TagError = require('../TagError');

module.exports = (new Tag({
	name: 'choose',
	description: 'Randomly picks a value from the arguments.',
	usage: '[opt1, opt2, ..., optN]',
	examples: [{
		input: '{choose;ayy;lmao}',
		output: 'lmao',
	}, {
		input: '{choose;puppies;kittens} are the best',
		output: 'puppies are the best',
	}],
}))
	.execute((args) => {
		if (!args[0]) {
			throw new TagError('You have to provide atleast one argument to the "{choose}" variable!', {
				// TODO: doc link to information about error
				infoLink: null,
			});
		}

		return args[Math.floor(Math.random() * args.length)];
	})
	.limit(5);
