const superagent = require('superagent');

const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, [query], {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'resolveid');

		if (!this.Atlas.lib.utils.isSnowflake(query)) {
			return responder.error('notASnowflake', msg.displayPrefix, query).send();
		}

		// check if the snowflake resolves to a channel
		const isChannel = msg.guild.channels.has(query);
		if (isChannel) {
			// forward to channelinfo
			const channelInfo = this.Atlas.commands.get('channelinfo');

			return channelInfo.execute(msg, [query], {
				settings,
			});
		}

		// we want to check if it's a guild before we check for a role because otherwise it might grab the @everyone role
		// which shares the guild ID
		try {
			const { body: guild } = await superagent.get(`https://discordapp.com/api/guilds/${query}/widget.json`);
			if (guild) {
				// we can get guild info from a widget. we *could* also get it if we have access to the guild but that's
				// a bit too slimey for me.
				return responder.embed({
					fields: [{
						name: 'type',
						value: 'guild',
						inline: true,
					}, {
						name: 'name',
						value: guild.name,
						inline: true,
					}, {
						name: 'onlineMembers.name',
						value: ['onlineMembers.value', guild.members.length.toLocaleString()],
						inline: true,
					}],
					timestamp: new Date(),
				}).send();
			}
			// superagent throws on 404
		// eslint-disable-next-line no-empty
		} catch (e) {}

		// check if the snowflake resolves to a cached role
		const isRole = msg.guild.roles.has(query);
		if (isRole) {
			// forward to roleinfo
			const roleInfo = this.Atlas.commands.get('roleinfo');

			return roleInfo.execute(msg, [query], {
				settings,
			});
		}

		// check if the snowflake resolves to a cached user
		const isUser = this.Atlas.client.users.has(query);
		if (isUser) {
			const whois = this.Atlas.commands.get('whois');

			return whois.execute(msg, [query], {
				settings,
			});
		}

		// result to more extreme measures
		// one way or another im gettin that id boi

		// more then likely it's a user's ID
		// check if atlas has seen the user before, no point going straight to discord
		const user = await settings.findUser(query);

		if (user) {
			const whois = this.Atlas.commands.get('whois');

			return whois.execute(msg, [query], {
				settings,
				user,
			});
		}

		// it's not a user so like
		// what else can a guy do
		return responder.error('notFound', query).send();
	}
};

module.exports.info = {
	name: 'resolveid',
	aliases: ['whatis', 'resolvesnowflake'],
	examples: [
		'111372124383428608',
		'345177567541723137',
	],
	guildOnly: true,
};
