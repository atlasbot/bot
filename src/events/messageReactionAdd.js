module.exports = class Event {
	constructor(Atlas) {
		this.Atlas = Atlas;
	}

	async execute(msg, emoji, userID) {
		const user = this.Atlas.client.users.get(userID);
		const collectors = this.Atlas.collectors.emojis.get(msg.id) || this.Atlas.collectors.emojis.get(userID);

		// strip emoji skin because it fucks with things
		// emoji.id is only set for custom emojis, otherwise atlas uses the emoji as the content
		const emid = this.Atlas.lib.utils.cleanEmoji(emoji.id || emoji.name);

		if (userID === this.Atlas.client.user.id) {
			return;
		}

		if (!msg.author) {
			msg = await this.Atlas.client.getMessage(msg.channel.id, msg.id);
		}

		if (collectors && collectors[0]) {
			collectors.forEach(c => c.fire(msg, emoji, userID));
		}

		if (msg.guild && user) {
			const settings = await this.Atlas.DB.getSettings(msg.guild.id);

			const roles = settings.plugin('roles');

			if (roles.state === 'enabled' && roles.options.reactions.length) {
				const reactions = roles.options.reactions.filter((r) => {
					if (r.channel && r.channel !== msg.channel.id) {
						return false;
					}

					if (r.message && r.message !== msg.id) {
						return false;
					}

					return r.emoji === emid;
				});

				const member = msg.guild.members.get(userID);

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

					if (added.length) {
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
			}, {
				msg,
				user,
			});
		}
	}
};
