const interp = async (tokens, info, functions) => {
	const output = [];
	for (const token of tokens) {
		if (token.type === 'BRACKETGROUP') {
			const thisToken = token.value.shift();

			// this fucking mess parses subtags
			const args = [];
			for (const [arg] of token.value) {
				if (arg.type !== 'WORD') {
					const out = await interp([arg], info, functions);

					args.push(out);
				} else {
					args.push(arg.value);
				}
			}

			if (functions.has(thisToken.value)) {
				// todo: handle tag errors, etc...
				const out = await functions.get(thisToken.value).execute(info, args);

				output.push(out);

				continue;
			}

			output.push(`{${thisToken.value}-INVALID}`);

			continue;
		}

		output.push(token.value);
	}

	return output.join('');
};

module.exports = interp;
