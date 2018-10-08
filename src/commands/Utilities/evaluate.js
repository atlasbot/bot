const Command = require('../../structures/Command.js');
const Parser = require('./../../tagengine');

module.exports = class TagEval extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = (new this.Atlas.structs.Responder(msg)).noDupe(false).localised(true);

		if (!args[0]) {
			return responder.error('You have to include something to evaluate!').send();
		}

		// todo: add more here
		const parser = new Parser({
			guild: msg.guild,
			channel: msg.channel,
			settings,
		});
		const ret = await parser.parse(args.join(' '));

		const output = ret.output || 'No variable output :c';

		if (ret.errors.length) {
			const errors = ret.errors.map(e => e.message);
			const uniq = errors
				.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

			return responder.embed({
				color: this.Atlas.colors.get('red').decimal,
				title: 'Errors',
				description: `• ${uniq.join('\n• ').substring(0, 2048)}`,
				fields: [{
					name: 'Output',
					value: output.substring(0, 1024),
				}],
			})
				.send();
		}

		return responder.text(`\`\`\`${output}\`\`\``).localised(true).send();
	}
};

module.exports.info = {
	name: 'tageval',
	description: 'Evaluate tags like {user.mention}.',
	aliases: [
		'evaluate',
		'tagevaluate',
		'evaltag',
	],
	localised: true,
	permissions: {
		user: {
			administrator: true,
		},
		bot: {
			embedLinks: true,
		},
	},
};
