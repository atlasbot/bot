const Command = require('../../structures/Command.js');

module.exports = class Unmute extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.error('mute.noArgs').send();
		}

		const query = args.shift();
		const target = await settings.findMember(query, {
			memberOnly: true,
		});

		if (!target) {
			if (!target) {
				return responder.error('general.noUserFound').send();
			}
		} else if (!target.punishable(msg.member)) {
			return responder.error('general.notPunishable');
		} else if (!target.punishable(msg.guild.me)) {
			return responder.error('general.lolno').send();
		}

		const jobs = await this.Atlas.agenda.agenda.jobs({
			'data.target': target.id,
			name: 'unmute',
			nextRunAt: {
				$gte: new Date(),
			},
		});

		if (jobs[0]) {
			jobs.forEach(job => job.remove());
		}

		/*
            If the job has a role ID in it and that role is still valid, try and use that
            Otherwise, try and use the guild's mute role if it's set
            if all else fails, try and find a role the user has called "muted" and remove it
        */
		let role;
		if (jobs[0]) {
			const job = jobs.find(j => target.roles.includes(j.attrs.data.role));
			if (job && msg.guild.roles.has(job.attrs.data.role)) {
				// at some point maybe having more info about the original mute could be nice
				// maybe time the mute was cut short? or something?
				role = msg.guild.roles.get(job.attrs.data.role);
			}
		} else if (target.roles.includes(settings.settings.plugins.moderation.mute_role)) {
			role = settings.muteRole;
		} else {
			role = msg.guild.roles.get(target.roles
				.map(r => msg.guild.roles.get(r))
				.find(r => r.name.toLowerCase() === 'muted'));
		}

		if (role) {
			// todo: log the unmute to the guild log
			if (role.position >= msg.guild.me.highestRole.position) {
				return responder.error('unmute.tooHigh').send();
			}
			await target.removeRole(role.id, `Un-mute by ${msg.author.tag} ${args[0] ? ` with reason "${args.join(' ')}"` : ''}`);

			this.Atlas.ignoreUpdates.push({
				role: role.id,
				user: target.id,
				date: new Date(),
			});

			const logEmbed = {
				title: 'general.logs.unmute.title',
				color: this.Atlas.colors.get('indigo').decimal,
				description: ['general.logs.unmute.description', target.tag],
				fields: [{
					name: 'general.logs.unmute.moderator.name',
					value: msg.author.tag,
					inline: true,
				}],
				thumbnail: {
					url: target.avatarURL || target.defaultAvatarURL,
				},
				timestamp: new Date(),
				footer: {
					text: `Target ${target.id} Mod ${msg.author.id}`,
				},
			};

			if (args[0]) {
				logEmbed.fields.push({
					name: 'general.logs.unmute.unmuteReason.name',
					value: args.join(' '),
					inline: true,
				});
			}

			settings.log(['action', 'mod'], logEmbed);

			return responder.text('unmute.success', target.tag).send();
		}

		// oh noes
		return responder.error('unmute.notMuted', target.tag).send();
	}
};

module.exports.info = {
	name: 'unmute',
	examples: [
		'@random',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
		bot: {
			manageRoles: true,
		},
	},
	guildOnly: true,
};
