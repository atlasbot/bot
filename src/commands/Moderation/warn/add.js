const Command = require('../../../structures/Command.js');


module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('warn.add.noArgs').send();
		}

		const query = args.shift();
		const target = await this.Atlas.util.findMember(msg.guild, query);

		if (!target) {
			return responder.error('general.noUserFound').send();
		}

		const reason = args.join(' ');

		if (!reason) {
			return responder.error('warn.add.noReason').send();
		}

		if (reason.length > 48) {
			return responder.error('warn.add.tooLong').send();
		}

		const { notified } = await settings.addInfraction({
			target: target.user || target,
			moderator: msg.author,
			reason,
		});

		const warnings = await settings.getInfractions(target);

		settings.log('mod', {
			color: this.Atlas.colors.get('orange').decimal,
			title: 'general.warning.title',
			description: ['general.warning.description', target.mention, target.tag, msg.author.mention, msg.author.tag],
			fields: [{
				name: 'general.warning.total.name',
				value: ['general.warning.total.value', target.tag, warnings.length],
				inline: true,
			}, {
				name: 'general.warning.dm.name',
				value: notified ? 'general.warning.dm.true' : 'general.warning.dm.false',
				inline: true,
			}, {
				name: 'general.warning.reason.name',
				value: args.length ? reason : 'general.warning.dm.value',
				inline: true,
			}],
			timestamp: new Date(),
			footer: {
				text: `Target ${target.id} Mod ${msg.author.id}`,
			},
		}).catch(() => false);

		return responder
			.text(`warn.add.success.${warnings.length === 1 ? 'singular' : 'plural'}`, target.mention, warnings.length)
			.send();
	}
};

module.exports.info = {
	name: 'add',
	aliases: [
		'+',
	],
	examples: [
		'@random breaking rule 3',
		'@random not playing nice',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
	},
	guildOnly: true,
};
