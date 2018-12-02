const TagError = require('./TagError');

const interp = async (tokens, info, functions) => {
	const output = [];
	const errors = [];

	for (const token of tokens) {
		if (token.type === 'BRACKETGROUP') {
			const thisToken = token.value.shift();

			const func = functions.get(thisToken.value);

			const parseArgs = async (args) => {
				// this fucking mess parses subtags
				const parsed = [];

				for (const arg of args) {
					if (arg.type !== 'WORD') {
						const childOutput = await interp([arg], info, functions);

						parsed.push(childOutput.output);
						errors.push(...childOutput.errors);
					} else {
						parsed.push(arg.value);
					}
				}

				return parsed;
			};

			let args = token.value.map(a => a[0]);

			if (func) {
				if (!func.info.dontParse) {
					args = await parseArgs(args);
				}

				try {
					const out = await func.execute(info, args, {
						output,
						errors,
					});

					output.push(out);
				} catch (e) {
					if (process.env.NODE_ENV === 'development') {
						console.warn(e);
					}

					if (e instanceof TagError) {
						errors.push(e);
					} else {
						errors.push(new TagError(e));
					}

					output.push(`{${thisToken.value}-ERROR${errors.length}}`);
				}

				continue;
			}

			output.push(`{${thisToken.value}-INVALID}`);

			continue;
		}

		output.push(token.value);
	}

	return {
		output: output.join(''),
		errors,
	};
};

module.exports = interp;
