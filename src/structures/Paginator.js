const Responder = require('./Responder');
const EmojiCollector = require('./EmojiCollector');

module.exports = class Paginator extends Responder {
	constructor(...args) {
		super(...args);
		this.page = {
			generator: null,
			enabled: false,
			current: 1,
			total: 1,
			user: null,
			listen: true,
			startAndEndSkip: true,
		};
		this.embedMsg = null;
		this.defaults = JSON.parse(JSON.stringify(this.page));
	}

	get showPages() {
		return this.page.enabled && this.page.total !== 1;
	}

	get footer() {
		return this.showPages ? `Page ${this.page.current}/${this.page.total}` : null;
	}

	/**
	 * Adds page buttons to the message and updates it on change.
	 * @param {Object} opts options
	 * @param {string} opts.user If set, only that user can change the page.
	 * @param {function} generator The function to generate the embed, gets passed the respond
     * @returns {Responder} The current responder instance
	 */
	paginate({
		user,
		page = 1,
		listen = true,
		startAndEndSkip = true,
		total,
	} = {}, generator) {
		this.page.generator = generator;
		this.page.enabled = !!generator;
		this.page.user = user;
		this.page.current = page;
		this.page.listen = listen;
		this.page.startAndEndSkip = startAndEndSkip;

		if (total) {
			this.page.total = total;
		}

		return this;
	}

	async send() {
		if (!this.page.enabled || this.embedMsg) {
			return super.send();
		}

		this._data.embed = this._parseObject(await this.page.generator(this));

		if (!this.showPages) {
			return super.send();
		}

		const res = await super.send();

		this.embedMsg = res;

		const emojis = [
			'⬅',
			'➡',
		];

		if (this.page.startAndEndSkip) {
			emojis.unshift('⏮');
			emojis.push('⏭');
		}
		this.collector = new EmojiCollector();
		this.collector
			.msg(res)
			.user(this.page.user)
			.emoji(emojis)
			.remove(true)
			.add(this.showPages)
			.exec((ignore, emoji) => {
				switch (emoji.name) {
					// todo: this needs improvement
					// fixme: has issues when going forward then back twice
					case '⬅':
						if (this.page.current <= 1) {
							return this.error('general.noMorePages', `<@${this.page.user}>`).send();
						}

						this.page.current--;

						return this.updatePage();
					case '➡':
						if (this.page.current >= this.page.total) {
							return this.error('general.noMorePages', `<@${this.page.user}>`).send();
						}
						this.page.current++;

						return this.updatePage();
					case '⏮':
						if (this.page.startAndEndSkip) {
							if (this.page.current === 1) {
								return this.error('general.noMorePages', `<@${this.page.user}>`).send();
							}
							this.page.current = 1;

							return this.updatePage();
						}
						break;
					case '⏭':
						if (this.page.startAndEndSkip) {
							if (this.page.current >= this.page.total) {
								return this.error('general.noMorePages', `<@${this.page.user}>`).send();
							}
							this.page.current = this.page.total;

							return this.updatePage();
						}
						break;
					default:
						return this.error('general.noMorePages', `<@${this.page.user}>`).send();
				}
			});

		if (this.page.listen) {
			await this.collector.listen();
		}

		return res;
	}

	async updatePage() {
		const em = this._parseObject(await this.page.generator(this));
		if (em) {
			return this.embedMsg.edit({
				embed: em,
			});
		}

		await this.error('general.noMorePages', `<@${this.page.user}>`).send();
	}
};
