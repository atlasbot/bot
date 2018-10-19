const Responder = require('./Responder');
const EmojiCollector = require('./EmojiCollector');
const FakeMessage = require('./FakeMessage');

// todo: only show buttons if they can be used (e.g, hide skip if there is no song to skip to or if it's disabled)

module.exports = class PlayerResponder extends Responder {
	constructor(player, lang, {
		settings,
	} = {}) {
		super(player.msg, lang);

		this.settings = settings;
		this.player = player;
		this._buttons = false;
	}

	/**
	 * Controls whether or not player buttons are added.
	 * @param {boolean} bool If true, buttons will be added to the message to control the player.
	 * @returns {PlayerResponder} the current responder
	 */
	buttons(bool) {
		this._buttons = bool;

		return this;
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
					.exec(async (msg, emoji, userID) => {
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
			}

			this.player.messages.push(res.id);
		} catch (e) {
			console.error(e);

			return res;
		}
	}
};
