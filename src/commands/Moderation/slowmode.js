const Endpoints = require('eris/lib/rest/Endpoints');
const Command = require('../../structures/Command.js');

/*!
    Note:
        At the time of writing this command, slowmode is still in beta and can't be toggled through the client or Eris
        so i've had to call it directly
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

		if (this.Atlas.lib.utils.parseBool(args[0]) === false || num === 0) {
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
