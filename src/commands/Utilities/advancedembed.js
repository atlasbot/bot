const parse = require('parse-color');
const Command = require('../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		parsedArgs,
	}) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'advancedembed');

		if (parsedArgs.d && msg.delete) {
			msg.delete().catch(() => false);
		}

		let toEdit;
		if (parsedArgs.edit) {
			toEdit = await this.Atlas.util.findMessage(msg.channel, parsedArgs.edit);

			if (!toEdit) {
				return responder.error('invalidEdit', parsedArgs.edit).send();
			}

			if (toEdit.author.id !== this.Atlas.client.user.id) {
				return responder.error('cannotEdit').send();
			}
		}

		let color;
		if (parsedArgs.color || parsedArgs.colour) {
			const unparsedColor = parsedArgs.color || parsedArgs.colour;

			color = this.Atlas.colors.get(unparsedColor.trim().toLowerCase()) || parse(unparsedColor);

			if (!color.hex) {
				return responder.error('unsupportedColor', unparsedColor).send();
			}
		}

		const embed = {
			color: color && parseInt(color.hex.replace(/#/g, ''), 16),
			title: !(parsedArgs.icon && !parsedArgs.name) ? parsedArgs.title : null,
			author: {
				name: parsedArgs.icon && !parsedArgs.name ? parsedArgs.title : parsedArgs.name,
				icon_url: parsedArgs.icon,
			},
			description: parsedArgs.description && parsedArgs.description.replace(/\\n/g, '\n'),
			fields: [],
			image: {
				url: parsedArgs.image,
			},
			thumbnail: {
				url: parsedArgs.thumbnail,
			},
			footer: {
				text: parsedArgs.footer,
			},
			timestamp: parsedArgs.timestamp && new Date(),
			url: parsedArgs.url,
		};

		for (const [name, value] of Object.entries(parsedArgs)) {
			const match = /field([0-9])value/.exec(name);

			if (match) {
				const [, number] = match;

				embed.fields.push({
					name: parsedArgs[`field${number}name`],
					value: value.toString(),
					inline: parsedArgs[`field${number}inline`],
				});
			}
		}

		const error = responder.validateEmbed(embed, false);

		if (error) {
			return responder.error('error', this.Atlas.lib.utils.parseJoiError(error).map(e => e.message).join(', ')).send();
		}

		return responder.localised().edit(toEdit).embed(embed).send();
	}
};

module.exports.info = {
	name: 'advancedembed',
	// DO NOT MODIFY ALIASES - lib assumes only "advancedembed" and "ae" aliases exist when converting tags > embeds
	aliases: [
		'ae',
	],
	examples: [
		'--title="My Embed" --description="A very interesting description" --color="pink"',
		'--color="#593001" --title="Welcome to my server" --description="Some very long description about why my server is the best and that you should just delete all your other servers and use mine instead." --timestamp',
	],
	supportedFlags: [{
		name: 'description',
		placeholder: 'text',
		desc: 'Sets the embed description.',
	}, {
		name: 'title',
		placeholder: 'text',
		desc: 'Sets the embed title.',
	}, {
		name: 'url',
		placeholder: 'url',
		desc: 'Sets the URL. General rule of thumb is that if you can send it to a channel and it turns blue, it should work.',
	}, {
		name: 'icon',
		placeholder: 'image url',
		desc: 'Sets the tiny icon next to the embed title.',
	}, {
		name: 'image',
		placeholder: 'image url',
		desc: 'Sets the embed image, the big one at the bottom of the embed.',
	}, {
		name: 'color',
		placeholder: 'color',
		desc: 'Sets the embed color. Can be a name of a color, hex #FFFFFF or RGB 255,255,255',
	}, {
		name: 'thumbnail',
		placeholder: 'image url',
		desc: 'Sets the large (but not largest) image that sits on the right of the embed. ',
	}, {
		name: 'footer',
		placeholder: 'text',
		desc: 'Sets the footer text.',
	}, {
		name: 'timestamp',
		desc: 'Whether or not to add a timestamp to the embed.',
	}, {
		name: 'name',
		desc: 'The author name. This or "title" are required for "icon" to work.',
	}, {
		name: 'edit',
		placeholder: 'message id',
		desc: 'Sets the message to edit. Must be in the same channel as the command invocation message.',
	}, {
		name: 'd',
		desc: 'Deletes the invocation message.',
	}],
	allowAllFlags: true,
	permissions: {
		bot: {
			embedLinks: true,
		},
		user: {
			embedLinks: true,
		},
	},
};
