const util = require('util');
const Command = require('../../structures/Command.js');

const tokens = [];
Object.keys(process.env).forEach((k) => {
	if (k.toLowerCase().includes('token') && process.env[k].length > 5) {
		tokens.push({
			name: k,
			value: process.env[k],
		});
	}
});

module.exports = class Eval extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
		parsedArgs,
	}) {
		const responder = (new this.Atlas.structs.Responder(msg)).localised().noDupe(false);
		if (msg.author.id !== process.env.OWNER) {
			return responder.error('no u').send();
		}
		try {
			const result = this.clean(util
				.inspect(await eval(args.join(' ')), false) // eslint-disable-line no-eval
				.substr(0, 1950));
			if (parsedArgs.silent) {
				return responder.text('Success, hiding output due to `--silent` flag.').send();
			}

			return responder.text(`\`\`\`js\n${result}\n\`\`\``).send();
		} catch (e) {
			// To test sentry and handlers
			if (args[0] === 'throw') {
				throw e;
			}

			// Any errors here are my fault
			responder.error(`Error: ${this.clean(util.inspect(e))}`, 5).send();
		}
	}

	clean(str) {
		for (const d of tokens) {
			str = str.replace(new RegExp(d.value, 'g'), `<${d.name}>`);
		}

		return str;
	}
};

module.exports.info = {
	name: 'eval',
	localised: true,
	hidden: true,
};
