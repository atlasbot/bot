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

		const [job] = await this.Atlas.agenda.agenda.jobs({
			'data.target': target.id,
			nextRunAt: {
				$gte: new Date(),
			},
		});

		if (job) {
			job.remove();
		}

		/*
            If the job has a role ID in it and that role is still valid, try and use that
            Otherwise, try and use the guild's mute role if it's set
            if all else fails, try and find a role the user has called "muted" and remove it
        */
		let role;
		if (job && msg.guild.roles.has(job.role)) {
			({ role } = job);
		} else if (target.roles.includes(settings.settings.plugins.moderation.mute_role)) {
			role = settings.muteRole;
		} else {
			role = target.roles
				.map(r => msg.guild.roles.get(r))
				.find(r => r.name.toLowerCase() === 'muted');
		}

		if (role) {
			// todo: log the unmute to the guild log
			if (role.position >= msg.guild.me.highestRole.position) {
				return responder.error('unmute.tooHigh').send();
			}
			await target.removeRole(role.id, `Un-mute by ${msg.author.tag}`);

			// todo: log unmute

			settings.log('mod', {
				title: 'User Unmuted',
				color: this.Atlas.colors.get('yellow').decimal,
				description: `${target.tag} (\`${target.id}\`) was unmuted by ${msg.author.tag} (\`${msg.author.id}\`)`,
				timestamp: new Date(),
			});

			return responder.text('unmute.success', target.tag).send();
		}

		// oh noes
		return responder.error('unmute.error', target.tag).send();
	}
};

module.exports.info = {
	name: 'unmute',
	usage: 'info.unmute.usage',
	description: 'info.unmute.description',
	examples: [
		'@random',
	],
	requirements: {
		permissions: {
			user: {
				manageMessages: true,
			},
			bot: {
				manageRoles: true,
			},
		},
	},
	guildOnly: true,
};
