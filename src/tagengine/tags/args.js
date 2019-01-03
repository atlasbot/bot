const TagError = require('../TagError');

module.exports = async ({ msg, Atlas }, [i, r = '1']) => {
	let args;
	if (msg.args) {
		// should already be there for commands
		({ args } = msg);
	} else {
		args = msg.content.split(/ +/g);
	}

	if (!i) {
		return args.join(' ');
	}

	const index = Atlas.lib.utils.parseNumber(i) - 1;
	if (isNaN(index)) {
		throw new TagError('"index" should be a number.');
	}

	const range = Atlas.lib.utils.parseNumber(r);
	if (isNaN(range)) {
		throw new TagError('"range" should be a number.');
	}

	const cloned = args.slice();

	return cloned.splice(index, range).join(' ');
};

module.exports.info = {
	name: 'args',
	args: '<index> <range=1>',
	description: 'Returns a random argument.',
	examples: [{
		input: '{args;1}',
		output: 'arg1',
		note: 'Input would be "a!actionlabel arg1 arg2".',
	}, {
		input: '{args;2}',
		output: 'arg2',
		note: 'Input would be "a!actionlabel arg1 arg2".',
	}, {
		input: '{args}',
		output: 'arg1 arg2',
		note: 'Input would be "a!actionlabel arg1 arg2".',
	}, {
		input: '{args;2;2}',
		output: 'arg2 arg3',
		note: 'Input would be "a!actionlabel arg1 arg2 arg3 arg4',
	}],
	dependencies: ['msg'],
};
