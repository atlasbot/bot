const GUILD_EMOJI_REGEX = /<a?:(.*):([0-9]{15,26})>/;

// eslint-disable-next-line
const template = (str, name) => `⠀ ⠀ ⠀  🤠\n　   ${str}${str}${str}\n    ${str}   ${str}　${str}\n   👇   ${str}${str} 👇\n  　  ${str}　${str}\n　   ${str}　 ${str}\n　   👢     👢\nhowdy. i'm the sheriff of ${name}`;

const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'cowboy');

		if (!args.length) {
			return responder.error('noArgs').send();
		}

		let emoji = this.Atlas.lib.emoji.get(args[0]);

		if (!emoji) {
			const match = GUILD_EMOJI_REGEX.exec(args[0]);
			if (match) {
				const [, name, guild] = match;

				emoji = {
					name,
					guild,
				};
			}
		}

		if (!emoji && !this.Atlas.lib.emoji.regex().test(args[0])) {
			return responder.error('notAnEmoji').send();
		}

		if (!emoji) {
			emoji = {
				name: msg.member.nick || msg.author.username,
			};
		}

		// :^)
		const ret = template(args[0], args[1] || emoji.name);

		return responder.localised().text(ret).send();
	}
};

module.exports.info = {
	name: 'cowboy',
};
