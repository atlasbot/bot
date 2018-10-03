const TagError = require('./../TagError');
const safeCompare = require('./../../../lib/utils/safeCompare');

/* eslint-disable no-case-declarations */
module.exports = ({
	parse,
}, args) => {
	// todo: test

	if (!args[1]) {
		throw new TagError('You need to provide atleast two arguments.');
	}

	switch (args.length) {
		case 1:
			// {if;awd} = true
			return !!args[1];
		case 2:
			// {if;awd;test} = test
			const [needs, _if1] = args;
			if (needs) {
				return parse(_if1);
			}
			break;
		case 3:
			// {if;awd;>;bwd} = true
			if (safeCompare.operators.includes(args[1])) {
				return !!safeCompare(...args);
			}

			// {if;awd;true;false} = true

			return (args[1]) ? parse(args[2]) : parse(args[3]);
		case 4:
			// {if;awd;>;bw;true} = true
			const [p11, op, p12, _if2] = args;

			// if the comparison was true, return _if2 ("true" in the example)
			return safeCompare(p11, op, p12) && parse(_if2);
		case 5:
			// {if;1;>;2;awd;wew} = wew
			const [p21, op2, p22, _if3, _else3] = args;

			return safeCompare(p21, op2, p22) ? parse(_if3) : parse(_else3);
		default:
			throw new TagError('Too many arguments.');
	}
};

module.exports.info = {
	name: 'if',
	// todo
	args: 'see examples',
	description: 'Compares values',
	examples: [{
		input: '{if;wew;aw yis}',
		output: 'aw yis',
	}, {
		input: '{if;;true;false}',
		output: 'false',
	}, {
		input: '{if;false;yay;nay}',
		output: 'false',
	}, {
		input: '{if;wew}',
		output: 'wew',
	}],
	dependencies: [],
	preParse: false,
};
