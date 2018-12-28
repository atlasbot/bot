const TagError = require('./TagError');
const Atlas = require('../../Atlas');

const interp = async (tokens, context, functions) => {
	const output = [];
	const errors = [];

	const parseArgs = async ([tkns], ctx = context) => {
		const out = [];

		if (!tkns) {
			return [];
		}

		for (const tkn of tkns) {
			// this fucking mess parses subtags
			const ret = await interp([tkn], ctx, functions);

			errors.push(...ret.errors);

			out.push(ret.output);
		}

		return out;
	};

	for (const token of tokens) {
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
					// (try) and run the tag
					const out = await func.execute({
						...context,
						parseArgs,
					}, args, {
						output,
						errors,
					});

					output.push(out);
				} catch (e) {
					// error handling
					if (process.env.NODE_ENV === 'development') {
						console.warn(e);
					}

					if (e instanceof TagError) {
						errors.push(e);
					} else {
						errors.push(new TagError(e));
					}

					output.push(`{${thisToken.value}-ERROR${errors.length}}`);

					if (Atlas.Raven) {
						Atlas.Raven.captureException(e);
					}
				}

				// if it ran into an error or was successful it would have been managed

				continue;
			}

			// invalid tag name
			output.push(`{${thisToken.value}-INVALID}`);

			continue;
		}

		// regular text/words
		output.push(token.value);
	}

	return {
		output: output.join(''),
		errors,
	};
};

module.exports = interp;
