const Command = require('../../structures/Command.js');
const parseTime = require('./../../../lib/utils/parseTime');

module.exports = class Mute extends Command {
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

		let role;
		let generated;
		if (!settings.muteRole) {
			// try create a mute role
			role = msg.guild.roles.find(r => r.name.toLowerCase().includes('muted'));

			if (!role) {
				if (!msg.guild.me.permission.json.manageChannels) {
					return responder.error('mute.generatePermError').send();
				}

				generated = true;

				role = await msg.guild.createRole({
					name: 'Muted',
					color: 6316128,
					mentionable: true,
					permissions: 104324161,
				}, 'Auto-generated to mute users');

				role.editPosition(msg.guild.me.highestRole.position - 1)
					.catch(() => false);
			}

			await settings.update({
				'plugins.moderation.mute_role': role.id,
			});
		} else {
			role = settings.muteRole;
		}

		// make sure permission overwrites are set
		for (const channel of msg.guild.channels.filter(c => (c.type === 0) || (c.type === 2))) {
			// we don't wanna fuck with permissions in ticket categories
			if (!(settings.ticketCategory && settings.ticketCategory.id === channel.parentID) || channel.permissionOverwrites.get(role.id)) {
				try {
					await channel.editPermission(role.id, 0, 2099264, 'role', 'Mute role permissions');
				} catch (e) {
					continue; // eslint-disable-line no-continue
				}
			}
		}

		if (role.position > msg.guild.me.highestRole.position) {
			return responder.error('mute.tooHigh').send();
		}

		const query = args.shift();
		const target = await settings.findMember(query, {
			memberOnly: true,
		});

		if (!target) {
			if (!target) {
				return responder.error('general.noUserFound').send();
			}
		} else if (target.roles.includes(role.id)) {
			return responder.error('mute.alreadyMuted', msg.displayPrefix).send();
		} else if (!target.punishable(msg.member)) {
			return responder.error('general.notPunishable');
		} else if (!target.punishable(msg.guild.me)) {
			return responder.error('general.lolno').send();
		}

		let reason;
		const index = args.findIndex(m => m === '|');
		if (index && args.length > 1) {
			reason = args.splice(index).join(' ').replace('|', '')
				.trim();
		}

		const parsed = parseTime(args.join(' '));

		if (parsed === 'INVALID') {
			return responder.error('mute.invalid').send();
		} if (parsed === 'SET_FOR_PAST') {
			return responder.error('mute.setForPast');
		} if (parsed.relative < 5000) {
			return responder.error('mute.furtherPls').send();
		}

		this.Atlas.ignoreUpdates.push({
			role: role.id,
			user: target.id,
			date: new Date(),
		});

		const data = {
			role: role.id,
			target: target.id,
			guild: msg.guild.id,
			moderator: msg.author.id,
			duration: parsed.relative,
			reason,
		};

		await this.Atlas.agenda.schedule('unmute', new Date(parsed.absolute), data);
		await settings.update({
			$push: {
				'plugins.moderation.mutes': data,
			},
		});

		await target.addRole(role.id, `Muted by ${msg.author.tag} ${reason ? ` with reason "${args.join(' ')}"` : ''}`);

		const logEmbed = {
			title: 'general.logs.mute.title',
			color: this.Atlas.colors.get('indigo').decimal,
			description: ['general.logs.mute.description', target.tag],
			fields: [
				{
					name: 'general.logs.mute.moderator.name',
					value: msg.author.tag,
					inline: true,
				},
				{
					name: 'general.logs.mute.duration.name',
					value: this.Atlas.lib.utils.prettyMs(parsed.relative),
					inline: true,
				},
			],
			thumbnail: {
				url: target.avatarURL,
			},
			footer: {
				// if anyone is up to the challenge, fitting the role ID in here would be nice, but it creates two lines and looks gross.
				// form over function :^)
				text: ['general.logs.mute.footer', target.id, msg.author.id],
			},
			timestamp: new Date(),
		};

		if (reason) {
			logEmbed.fields.push({
				name: 'general.logs.mute.reason.name',
				value: reason,
				inline: true,
			});
		}

		settings.log(['action', 'mod'], logEmbed);

		responder.text('mute.success', target.tag, this.Atlas.lib.utils.prettyMs(parsed.relative, {
			verbose: true,
		}));

		if (generated) {
			responder.text('mute.generated');
		}

		return responder.send();
	}
};

module.exports.info = {
	name: 'mute',
	examples: [
		'@random 5m | being mean',
		'@random 10h | verbal diarrhea',
		`${process.env.OWNER} 10 hours | stop being mean`,
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
