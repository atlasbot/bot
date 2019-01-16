const safeCompare = require('atlas-lib/lib/utils/safeCompare');
const TagError = require('../TagError');

module.exports = async ({
	parseArg,
	textArgs,
	parseArgs,
}, rawArgs) => {
	if (textArgs.length < 2) {
		throw new TagError('You need to provide atleast two arguments.');
	}

	const { length } = textArgs;

	try {
		if (length === 2) {
		// {if;condition;then}
			const [rawCondition, rawThen] = rawArgs;

			const needs = await parseArg(rawCondition);

			if (needs && needs !== 'false') {
				return parseArg(rawThen);
			}
		}

		if (length === 3) {
		// {if;condition;then;else}
			const [rawCond, rawThen, rawElse] = rawArgs;
			// parse required args
			const cond = await parseArg(rawCond);

			if (cond && cond !== 'false') {
			// then
				return parseArg(rawThen);
			}

			return parseArg(rawElse);
		}

		if (length === 4) {
		// {if;condition1;operator;condition2;then}
			const [rawCond1, rawOp, rawCond2, rawThen] = rawArgs;
			// parse required args
			const [cond1, op, cond2] = await parseArgs([rawCond1, rawOp, rawCond2]);

			if (safeCompare(cond1, op, cond2)) {
			// then
				return parseArg(rawThen);
			}
		}

		if (length === 5) {
		// {if;condition1;operator;condition2;then;else}
			const [rawCond1, rawOp, rawCond2, rawThen, rawElse] = rawArgs;
			// parse required args
			const [cond1, op, cond2] = await parseArgs([rawCond1, rawOp, rawCond2]);

			if (safeCompare(cond1, op, cond2)) {
			// if
				return parseArg(rawThen);
			}

			// else
			return parseArg(rawElse);
		}
	} catch (e) {
		if (e.message.includes('Unknown operator')) {
			throw new TagError('Unknown operator');
		}

		throw e;
	}
};

module.exports.info = {
	name: 'if',
	// todo
	args: 'see examples',
	description: 'Compares values. Unlike most other tags, conditional parsing is enabled, meaning yes will be parsed and no will not in {if;true;===;true;yes;no}.',
	examples: [{
		input: '{if;false;yay}',
		output: 'yay',
	}, {
		input: '{if;condition;yay;nay}',
		output: 'yay',
	}, {
		input: '{if;cond;===;cond;yay}',
		output: 'yay',
	}, {
		input: '{if;cond;!==;cond;yay}',
		output: '',
	}, {
		input: '{if;true;===;true;yay;nay}',
		output: 'yay',
	}],
	dependencies: [],
	dontParse: true,
};
