const TagError = require('./TagError');
const Atlas = require('../../Atlas');

const interp = async (tokens, context, functions) => {
	const output = [];
	const errors = [];

	const parseArgs = async (tkns, ctx = context) => {
		let returnArray = true;
		const out = [];

		if (!Array.isArray(tkns[0])) {
			tkns = [tkns];
			returnArray = false;
		}

		if (!tkns) {
			return [];
		}

		for (const tkn of tkns) {
			// this fucking mess parses subtags
			const ret = await interp(tkn, ctx, functions);

			errors.push(...ret.errors);

			out.push(ret.output);
		}

		return returnArray ? out : out[0];
	};

	for (const token of tokens) {
		if (!token) {
			continue;
		}

		if (token.type === 'BRACKETGROUP') {
			const thisToken = token.value.shift();

			const func = functions.get(thisToken.value);

			let args = token.value;
			if (func && !func.info.dontParse) {
				args = await parseArgs(token.value);
			}

			if (func) {
				// wew valid tag
				if (func.info.dependencies && func.info.dependencies.some(k => !context[k])) {
					output.push(`{${thisToken.value}-MISSINGDEP}`);

					continue;
				}

				try {
					let textArgs = [];
					if (func.info.dontParse) {
						textArgs = args.map((a) => {
							// don't worry about it ;)
							let val = '';

							for (const x of a) {
								if (Array.isArray(x.value)) {
									val += x.value[0].value;
								} else {
									val += x.value;
								}
							}

							return val;
						});
					}
					// (try) and run the tag
					const out = await func.execute({
						...context,
						parseArgs,
						textArgs,
					}, args, {
						output,
						errors,
					});

					output.push(out);
				} catch (e) {
					// error handling
					if (e instanceof TagError) {
						errors.push(e);
					} else {
						errors.push(new TagError(e));
					}

					if (process.env.NODE_ENV === 'development' || process.env.VERBOSE === 'true') {
						console.warn(e);
					}

					Atlas.Sentry.captureException(e);

					output.push(`{${thisToken.value}-ERROR${errors.length}-${e.message.split(' ').join('-').toLowerCase().replace(/[^A-z-]/g, '')}}`);
				}

				// if it ran into an error or was successful it would have been managed

				continue;
			}

			// invalid tag name
			output.push(`{${thisToken.value}}`);

			continue;
		}

		// regular text/words
		output.push(token.value);
	}

	return {
		output: output.join('').trim(),
		errors,
	};
};

module.exports = interp;
