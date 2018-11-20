// special tag so it gets special treatment

// todo: ability to return the command output (probably catch it in the responder before sending it)
// todo: ability to override permissions and let any user run any comand, probably a true/false value
// todo: "advanced" command tag that supports those ^, adding it here would break backwards compatibility

module.exports = class {
	constructor(command, settings) {
		this.command = command;
		this.settings = settings;
	}

	get info() {
		return {
			description: `Tag wrapper for "${this.command.info.name}": ${this.command.getInfo(this.settings.lang).description}`,
			dependencies: ['guild', 'channel', 'user'],
		};
	}

	async execute({ guild, channel, user, msg }, args) {
		await this.command.execute({
			author: user,
			guild,
			member: guild.members.get(user.id),
			channel,
			lang: this.settings.lang,
			timestamp: msg.timestamp || Date.now(),
			type: 0,
		}, args, {
			settings: this.settings,
			parsedArgs: {},
		});
	}
};
