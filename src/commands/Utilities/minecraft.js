const superagent = require('superagent');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg);

		if (!args.length) {
			return responder.error('minecraft.noArgs').send();
		}

		let [ip, port] = args[0].split(':'); // eslint-disable-line prefer-const

		if (!ip) {
			return responder.error('minecraft.invalidIP', args.join(' ')).send();
		}

		if (!port) {
			port = '25565';
		}

		const { body } = await superagent.get('https://mcapi.us/server/status')
			.query({
				ip,
				port,
			})
			.set('User-Agent', this.Atlas.userAgent);

		if (body.status !== 'success' || body.error || !body.motd) {
			return responder.error('minecraft.invalidIP', args.join(' ')).send();
		}

		const embed = {
			title: ip,
			thumbnail: {},
			fields: [{
				name: 'minecraft.status',
				value: body.online ? 'minecraft.online' : 'minecraft.offline',
				inline: true,
			}, {
				name: 'minecraft.players.name',
				value: body.online ? [
					'minecraft.players.value',
					body.players.now.toLocaleString(),
					body.players.max.toLocaleString(),
				] : '???',
				inline: true,
			}, {
				name: 'minecraft.software.name',
				value: body.server.name,
				inline: true,
			}],
			footer: {
				text: ['minecraft.lastChecked'],
			},
			timestamp: new Date(body.last_updated * 1000),
			description: body.motd.replace(/§[A-z0-9]/g, ''),
		};

		// server uptime
		if (body.duration) {
			embed.fields.push({
				name: 'minecraft.uptime.name',
				value: this.Atlas.lib.utils.prettyMs(body.duration, {
					verbose: false,
				}),
				inline: true,
			});
		}

		// if the server has a favicon, let's show it
		if (body.favicon) {
			// getting the data from the URI
			const comma = body.favicon.indexOf(',');
			const data = unescape(body.favicon.substring(comma + 1));

			// generating a alphanumeric file name
			// some servers may not have a png icon, but i don't know if that's possible.
			const fileName = `${`${ip}:${port}`.replace(/[^a-zA-Z0-9 -]/g, '')}.png`;

			responder.file({
				file: Buffer.from(data, 'base64'),
				name: fileName,
			});

			// sets the thumbnail to the attachment
			embed.thumbnail.url = `attachment://${fileName}`;
		}

		return responder.embed(embed).send();
	}
};

module.exports.info = {
	name: 'minecraft',
	aliases: [
		'mcserver',
	],
	examples: [
		'play.hypixel.net',
	],
};
