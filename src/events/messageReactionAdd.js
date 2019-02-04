module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg, emoji, userID) {
		const user = this.Atlas.client.users.get(userID);
		const collectors = this.Atlas.collectors.emojis.get(msg.id) || this.Atlas.collectors.emojis.get(userID);

		const meta = this.Atlas.lib.emoji.get(emoji.name) || {};

		emoji = {
			...emoji,
			char: meta.char || emoji.name,
			meta,
		};

		// strip emoji skin because it fucks with things
		// emoji.id is only set for custom emojis, otherwise atlas uses the emoji as the content
		const emid = this.Atlas.lib.utils.cleanEmoji(emoji.char || emoji.id || emoji.name);

		if (userID === this.Atlas.client.user.id) {
			return;
		}

		if (!msg.author) {
			try {
				msg = await this.Atlas.client.getMessage(msg.channel.id, msg.id);
			} catch (e) {
				// if we can't have the full message then we'll be picky and throw our food on the floor
				return;
			}
		}

		if (collectors && collectors[0]) {
			collectors.forEach(c => c.fire(msg, emoji, userID));
		}

		if (msg.guild && user) {
			const settings = await this.Atlas.DB.getGuild(msg.guild);

			const roles = settings.plugin('roles');

			if (roles.state === 'enabled' && roles.options.reactions.length) {
				const reactions = roles.options.reactions.filter((r) => {
					if (r.channel && r.channel !== msg.channel.id) {
						return false;
					}

					if (r.message && r.message !== msg.id) {
						return false;
					}

					return r.emoji === emoji.id || this.Atlas.lib.emoji.compare(r.emoji, emid);
				});

				const member = await settings.findUser(userID, {
					memberOnly: true,
				});

				const toAdd = reactions
					.map(r => msg.guild.roles.get(r.role))
					.filter(r => r && !r.higherThan(msg.guild.me.highestRole) && !member.roles.includes(r.id));

				if (toAdd.length) {
					const added = [];
					for (const role of toAdd.slice(0, 3)) {
						try {
							await member.addRole(role.id);

							added.push(role);
						} catch (e) {
							console.warn(e);
						}
					}

					if (roles.options.reaction_dm && added.length) {
						const responder = new this.Atlas.structs.Responder(msg, settings.lang);

						const raw = emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name;

						responder
							.dm(userID)
							.text('general.roles.reactionAdd', added.map(r => r.name).join('`, `'), raw)
							.send().catch(console.warn);
					}
				}
			}

			await settings.runActions({
				guild: msg.guild.id,
				'trigger.type': 'reactionAdd',
				'trigger.content': emid,
				'flags.enabled': true,
			}, {
				msg,
				user,
			});
		}
	}
};
