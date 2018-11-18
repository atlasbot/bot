const Command = require('../../../structures/Command.js');


module.exports = class Action extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const [filterName, ...action] = args;

		if (!filterName) {
			return responder.error('filters.action.noFilter').send();
		}

		// grabbing and validating the channel
		const filter = (new this.Atlas.lib.structs.Fuzzy(this.Atlas.filters, {
			keys: ['info.name', 'info.settingsKey'],
		})).search(filterName);

		if (!filter) {
			return responder.error('filters.action.noFilter').send();
		}

		const possible = [];
		for (const x of this.Atlas.constants.actionTypes) {
			x.human = responder.format(`general.filters.actions.${x.key}`);

			possible.push(x);
		}

		const noAction = () => responder.error('filters.action.noAction', possible.map(c => c.human).join('`, `')).send();

		if (!action[0]) {
			return noAction();
		}

		const newType = (new this.Atlas.lib.structs.Fuzzy(possible, {
			keys: ['human', 'type', 'key'],
		})).search(action.join(' '));

		if (!newType) {
			return noAction();
		}

		await settings.update({
			[`plugins.moderation.filters.${filter.info.settingsKey}.action_type`]: newType.type,
		});

		return responder.text('filters.action.success', filter.info.name, newType.human).send();
	}
};

module.exports.info = {
	name: 'action',
	guildOnly: true,
	examples: [
		'capitalization disabled',
		'capitalization delete the message',
		'cursing 3',
	],
	aliases: [
		'filter',
	],
	permissions: {
		user: {
			manageMessages: true,
		},
	},
};
