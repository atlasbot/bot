const prettyMs = require('pretty-ms');
const Command = require('../../structures/Command.js');
const parseTime = require('./../../util/parseTime');
// const util = require('util');

// 30 minutes
const defaultMs = 30 * 60 * 1000;

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

		const parsed = parseTime(args.join(' '), defaultMs);

		if (parsed === 'SET_FOR_PAST') {
			return responder.error('mute.setForPast');
		} if (parsed.relative < 5000) {
			return responder.error('mute.furtherPls').send();
		}

		const data = {
			role: role.id,
			reason,
			target: target.id,
			guild: msg.guild.id,
			moderator: msg.author.id,
			duration: parsed.relative,
		};

		await this.Atlas.agenda.schedule('unmute', new Date(parsed.absolute), data);
		await settings.update({
			$push: {
				'plugins.moderation.mutes': data,
			},
		});

		await target.addRole(role.id);

		// todo: log mute

		responder.text('mute.success', target.tag, prettyMs(parsed.relative, {
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
	usage: 'info.mute.usage',
	description: 'info.mute.description',
	examples: [
		'@random 5m | being mean',
		'@random 10h | verbal diarrhea',
		'111372124383428608 10 hours | stop being mean',
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
