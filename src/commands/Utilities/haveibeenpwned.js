const superagent = require('superagent');

const Command = require('../../structures/Command.js');

module.exports = class HIBPWNED extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Paginator(msg, msg.lang, 'haveibeenpwned');

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		if (msg.guild && msg.channel.permissionsOf(msg.guild.me.id).has('manageMessages')) {
			responder.mention(msg.author);

			// delete the message just incase.
			await msg.delete();
		}

		try {
			const { body } = await superagent.get(`https://haveibeenpwned.com/api/v2/breachedaccount/${args[0]}`);

			body.sort((a, b) => b.PwnCount - a.PwnCount);

			const dm = await msg.author.getDMChannel();

			await responder.channel(dm.id).paginate({
				user: msg.author.id,
				total: body.length,
			}, (paginator) => {
				const breach = body[paginator.page.current - 1];

				if (!breach) {
					return;
				}

				const snippet = this.Atlas.lib.utils.snippet(this.Atlas.lib.utils.cleanHTML(breach.Description), {
					length: 300,
				});

				// bit of a rant but i dislike api's that use UpperCase Key Names
				// it just looks

				// gross

				return {
					title: breach.Name,
					author: {
						name: args[0],
					},
					description: snippet,
					thumbnail: {
						url: breach.LogoPath,
					},
					url: `https://${breach.Domain}`,
					fields: [{
						name: 'breach',
						value: this.Atlas.lib.utils.timeFormat(new Date(breach.BreachDate)),
						inline: true,
					}, {
						name: 'pwnedUsers',
						value: breach.PwnCount.toLocaleString(),
						inline: true,
					}, {
						name: 'compromisedData',
						value: breach.DataClasses.join(', '),
					}],
					footer: {
						text: ['footer', paginator.page.current, paginator.page.total],
					},
				};
			}).send();

			if (msg.guild) {
				return responder.text('success').send();
			}
		} catch (e) {
			if (e.status === 404) {
				return responder.error('noBreaches').send();
			}

			return responder.error('unknownError').send();
		}
	}
};

module.exports.info = {
	name: 'haveibeenpwned',
	aliases: ['hibp', 'hibpwned'],
	examples: [
		'admin@google.com',
		'test@example.com',
	],
	guildOnly: false,
};
