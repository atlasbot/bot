const Command = require('../../structures/Command.js');
const Parser = require('./../../tagengine');

const MENTION_REGEX = /<@[0-9]{15,25}>/;

module.exports = class TagEval extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = (new this.Atlas.structs.Responder(msg)).noDupe(false).localised();

		if (!args.length) {
			return responder.error('You have to include something to evaluate!').send();
		}

		const parser = new Parser({
			msg,
			settings,
		}, false);

		const ret = await parser.parse(args.join(' '));

		const output = ret.output || 'No variable output :c';

		if (ret.errors.length) {
			return responder.embed({
				color: this.Atlas.colors.get('red').decimal,
				title: 'Errors',
				fields: [{
					name: 'Output',
					value: output.substring(0, 1024).replace(/ERROR[0-9]+/g, match => `**${match}**`).trim() || 'No output :c',
				}],
				description: ret.errors.map((e, i) => `${i + 1}. ${e.message}`).join('\n').substring(0, 2048),
			}).send();
		}

		if (MENTION_REGEX.test(output)) {
			// codeblocks don't show mentions and mentions not working or showing up as <@091823> could confuse people so ¯\_(ツ)_/¯
			return responder.text(output).localised().send();
		}

		// but i still like codeblocks

		return responder.text(`\`\`\`${output}\`\`\``).localised().send();
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
