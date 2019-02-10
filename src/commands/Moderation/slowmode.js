const Endpoints = require('eris/lib/rest/Endpoints');
const Command = require('../../structures/Command.js');

/*!
    Note:
        Eris doesn't currently support "rate_limit_per_user" properly, so below we go
*/
module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		const num = this.Atlas.lib.utils.parseNumber(args[0]);

		if (this.Atlas.lib.utils.toggleType(args[0], false) === false || num === 0) {
			await this.Atlas.client.requestHandler.request('PATCH', Endpoints.CHANNEL(msg.channel.id), true, {
				rate_limit_per_user: 0,
			});

			return responder.text('slowmode.disabled', msg.channel.mention).send();
		}

		if (isNaN(num)) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		if (num < 0 || num > 120) {
			return responder.error('slowmode.invalid').send();
		}

		await this.Atlas.client.requestHandler.request('PATCH', Endpoints.CHANNEL(msg.channel.id), true, {
			rate_limit_per_user: num,
		});

		return responder.text('slowmode.success', this.Atlas.lib.utils.prettyMs(num * 1000)).send();
	}
};

module.exports.info = {
	name: 'slowmode',
	examples: [
		'120',
		'0',
		'off',
	],
	permissions: {
		user: {
			manageChannels: true,
		},
		bot: {
			embedLinks: true,
			manageChannels: true,
		},
	},
	guildOnly: true,
};
