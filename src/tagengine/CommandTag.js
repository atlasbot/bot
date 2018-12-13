// special tag so it gets special treatment

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
			guild,
			channel,
			type: 0,
			author: user,
			member: guild.members.get(user.id),
			lang: this.settings.lang,
			prefix: this.settings.prefix,
			displayPrefix: this.settings.prefix,
			timestamp: msg.timestamp || Date.now(),
		}, args, {
			settings: this.settings,
			parsedArgs: {},
		});
	}
};
