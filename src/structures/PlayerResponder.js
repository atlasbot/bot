const Responder = require('./Responder');
const EmojiCollector = require('./EmojiCollector');
const FakeMessage = require('./FakeMessage');

module.exports = class PlayerResponder extends Responder {
	constructor(player, lang, {
		settings,
	} = {}) {
		console.log(lang, player.msg.lang);
		super(player.msg, lang);

		this.settings = settings;
		this.player = player;
		this._buttons = false;
	}

	buttons(bool) {
		this._buttons = bool;
	}

	async send() {
		// call the og responder send() and get the response, then we can handle it
		const res = await super.send();

		try {
			const plugin = this.settings.plugin('music');

			if (plugin.options.player_buttons) {
				res.collector = new EmojiCollector();
				res.collector
					.msg(res)
					.emoji([
						// '⏸',
						// '▶',
						// '🔁',
						'⏭',
					])
					.remove(true)
					.exec(async (ignore, emoji, userID) => {
						const fakeMsg = new FakeMessage({
							channelID: this.player.msg.channel.id,
							author: this.Atlas.client.users.get(userID) || this.player.msg.author,
							lang: this._data.lang,
						});
						switch (emoji.name) {
							case '⏭':
								fakeMsg.content = `${this.settings.prefix}skip`;

								try {
									await this.Atlas.commands.get('skip').execute(fakeMsg.get(), [], {
										settings: this.settings,
										parsedArgs: {},
									});
								} catch (e) {
									// this should probably be handled better
									console.error(e);
								}

								break;
							default:
								break;
						}
					})
					.listen();
			} else {
				console.warn('no player messages enabled');
			}

			this.player.messages.push(res.id);
		} catch (e) {
			console.error(e);

			return res;
		}
	}
};
