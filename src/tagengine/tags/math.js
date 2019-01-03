const { Parser } = require('expr-eval');
const TagError = require('./../TagError');

module.exports = (info, args) => {
	if (!args.length) {
		throw new TagError('This tag requires atleast one argument.');
	}

	return Parser.evaluate(args.join(' '));
};

module.exports.info = {
	name: 'math',
	args: '[expression]',
	description: 'Evaluates a math expression.',
	examples: [{
		input: '{math;9+10}',
		output: '21',
	}],
	dependencies: [],
};
