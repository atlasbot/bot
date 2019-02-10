const TagError = require('./TagError');
const commandTag = require('./commandTag');

const interp = async (tokens = [], context, functions) => {
	const output = [];
	const errors = [];

	const { Atlas } = context;

	const parseArgs = async (tkns = [], ctx = context) => {
		const out = [];

		if (!tkns || !tkns.length) {
			return [];
		}

		for (const tkn of tkns) {
			const ret = await interp(tkn, ctx, functions);

			errors.push(...ret.errors);

			out.push(ret.output);
		}

		return out;
	};

	const parseArg = async (arg, ctx) => {
		if (!arg) {
			return;
		}

		const [ret] = await parseArgs([arg], ctx);

		return ret;
	};

	for (const token of tokens) {
		if (!token) {
			continue;
		}

		if (token.type === 'BRACKETGROUP') {
			const thisToken = token.value.shift();

			let func = functions.get(thisToken.value.toLowerCase(), token.value);

			let args = token.value;
			if (func && !func.info.dontParse) {
				args = await parseArgs(token.value);

				if (func.info.command) {
					// a little hack to get subcommands to work
					const sub = func.info.command.subcommands.get(args[0]) || func.info.command.subcommands.get(func.info.command.subcommandAliases.get(args[0]));

					if (sub) {
						func = commandTag(sub, context);
					}
				}
			}

			if (func) {
				// wew valid tag
				const missing = func.info.dependencies && func.info.dependencies.find(k => !context[k]);
				if (missing) {
					output.push(`{${thisToken.value}-missing-dependency-${missing}}`);

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
						parseArg,
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
						Atlas.Sentry.captureException(e);

						if (e instanceof Error) {
							throw e;
						}

						throw new Error(e);
					}

					if (process.env.NODE_ENV === 'development' || process.env.VERBOSE === 'true') {
						console.warn(e);
					}

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
