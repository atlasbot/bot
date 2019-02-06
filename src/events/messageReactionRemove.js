module.exports = class {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg, emoji, userID) {
		const user = this.Atlas.client.users.get(userID);

		const emid = this.Atlas.lib.utils.cleanEmoji(emoji.id || emoji.name);

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

				const toRemove = reactions
					.map(r => msg.guild.roles.get(r.role))
					.filter(r => r && !r.higherThan(msg.guild.me.highestRole) && (member.roles || []).includes(r.id));

				if (toRemove.length) {
					// max 3 roles per reaction

					const removed = [];
					for (const role of toRemove.slice(0, 3)) {
						try {
							await member.removeRole(role.id);

							removed.push(role);
						} catch (e) {
							console.warn(e);
						}
					}

					if (roles.options.reaction_dm && removed.length) {
						const responder = new this.Atlas.structs.Responder(msg, settings.lang);

						const raw = emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name;

						responder
							.dm(userID)
							.text('general.roles.reactionRemove', removed.map(r => r.name).join('`, `'), raw)
							.send().catch(console.warn);
					}
				}
			}

			await settings.runActions({
				guild: msg.guild.id,
				'trigger.type': 'reactionRemove',
				// emoji.id is only set for custom emojis, otherwise atlas uses the emoji as the content
				'trigger.content': emid,
				'flags.enabled': true,
			}, {
				msg,
				user,
			});
		}
	}
};
