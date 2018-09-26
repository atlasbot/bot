const parseTime = require('./../../../lib/utils/parseTime');
const Command = require('../../structures/Command.js');

module.exports = class RemindMe extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	action(msg, args, {
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args[0]) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		const parsed = parseTime(args.join(' '));

		if (parsed === 'INVALID') {
			return responder.error('remindme.invalid').send();
		} if (parsed === 'SET_FOR_PAST') {
			return responder.error('remindme.setForPast');
		}

		if (parsed.relative < 5000) {
			return responder.error('remindme.furtherPls').send();
		}

		this.Atlas.agenda.schedule('reminder', new Date(parsed.absolute), {
			message: args.join(' '),
			requested: new Date(),
			channel: msg.channel.id,
			user: msg.author.id,
		})
			.then(() => {
				responder.text('remindme.youGotIt', this.Atlas.lib.utils.prettyMs(parsed.relative, {
					verbose: true,
				}));

				if (parsed.mode !== 'relative') {
					responder.text('remindme.relative');
				}

				return responder.send();
			})
			.catch((e) => {
				console.error(e);

				return responder.text('An error occured scheduling your reminder.').send();
			});
	}
};

module.exports.info = {
	name: 'remindme',
	usage: 'info.remindme.usage',
	description: 'info.remindme.description',
	fullDescription: 'info.remindme.fullDescription',
	aliases: ['remind', 'rmde'],
	examples: [
		'to take out the trash in 5 hours',
		'15m',
		'dab on those haters 10 hours',
		'21 aug 2018',
		'1 minute',
		'5 minutes',
		'2 minutes 30 seconds',
	],
};
