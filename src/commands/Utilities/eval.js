const util = require('util');
const Command = require('../../structures/Command.js');

const tokens = [];
Object.keys(process.env).forEach((k) => {
	if (['mongo_uri', 'token', 'key', 'client_id', 'pass', 'host'].some(x => k.toLowerCase().includes(x)) && process.env[k].length > 5) {
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
		settings,
		parsedArgs,
		...extra
	}) {
		const responder = (new this.Atlas.structs.Responder(msg)).localised().noDupe(false);

		if (msg.author.id !== process.env.OWNER) {
			const evaluate = this.Atlas.commands.get('evaluate');

			// if they aren't a developer then they probably wanted "evaluate"
			// if they didn't want it then it's what they're getting anyway.
			// also gonna be funny when people thing they've gotten eval perms
			return evaluate.execute(msg, args, {
				settings,
				parsedArgs,
				...extra,
			});
		}

		if (process.env.NODE_ENV === 'production') {
			return responder.error('"eval" is disabled in production.').send();
		}

		try {
			const result = this.clean(util
				.inspect(await eval(args.join(' ')), false) // eslint-disable-line no-eval
				.substr(0, 1950));

			return responder.text(`\`\`\`js\n${result}\n\`\`\``).send();
		} catch (e) {
			// To test sentry and handlers
			if (args[0] === 'throw') {
				throw e;
			}

			// Any errors here are my fault
			responder.error(`Error: ${this.clean(util.inspect(e)).substring(0, 1850)}`, 5).send();
		}
	}

	clean(str) {
		for (const d of tokens) {
			str = str.split(d.value).join(`<${d.name}>`);
		}

		return str;
	}
};

module.exports.info = {
	name: 'eval',
	allowAllFlags: true,
	localised: true,
	hidden: true,
};
