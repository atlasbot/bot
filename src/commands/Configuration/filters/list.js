const Command = require('../../../structures/Command.js');


module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const actionTypes = [];
		for (const x of this.Atlas.constants.actionTypes) {
			x.human = responder.format(`general.filters.actions.${x.key}`);

			actionTypes.push(x);
		}

		const filters = Array.from(this.Atlas.filters.values());

		const col1 = [];
		const col2 = [];

		filters.forEach((f) => {
			const s = settings.plugin('moderation').filters[f.info.settingsKey];

			col1.push(f.info.name);
			col2.push(`\`${actionTypes.find(c => c.type === s.action).human}\``);
		});

		return responder.embed({
			fields: [
				{
					name: 'filters.list.title',
					value: col1.join('\n'),
					inline: true,
				},
				{
					// This has a zero-width character in it
					name: '​',
					value: col2.join('\n'),
					inline: true,
				},
			],
			timestamp: new Date(),
		}).send();
	}
};

module.exports.info = {
	name: 'list',
	guildOnly: true,
	aliases: [
		'show',
	],
	permissions: {
		bot: {
			embedLinks: true,
		},
	},
};
