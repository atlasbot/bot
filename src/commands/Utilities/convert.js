const superagent = require('superagent');
const convert = require('convert-units');

const Cache = require('atlas-lib/lib/structures/Cache');
const currencyCodes = require('../../../data/currencyCodes.json');

const Command = require('../../structures/Command.js');

const cache = new Cache('currencies');

// REGEX ALL THE THINGS! /s
// regex was just the easiest solution i could think of
const REGEX = /([0-9,. ]+) ?([A-z-_,]+) (?:to )?([A-z-_,]+)/i;

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'convert');

		if (!args.length) {
			return responder.embed(this.helpEmbed(msg)).send();
		}

		let [, uncleanUnits, from, to] = REGEX.exec(args.join(' ')) || []; // eslint-disable-line prefer-const

		const units = this.Atlas.lib.utils.parseNumber(uncleanUnits);

		if (!units) {
			return responder.error('invalidUnits').send();
		}

		if (!from) {
			return responder.error('invalidFrom').send();
		}

		if (!to) {
			return responder.error('invalidTo').send();
		}

		let currency = {
			base: 'EUR',
			rates: {},
		};

		// try/catch getCurrencies() so it doesn't nuke the whole command if currency conversion is offline
		try {
			currency = await this.getCurrencies();
		} catch (e) {} // eslint-disable-line no-empty

		let fromCode = from.trim().toUpperCase();

		const fromCurrency = this.Atlas.lib.utils.nbsFuzzy(currencyCodes, ['code', 'currency', 'countries'], from);
		if (fromCurrency) {
			fromCode = fromCurrency.code;
		}

		let toCode = to.trim().toUpperCase();

		const toCurrency = this.Atlas.lib.utils.nbsFuzzy(currencyCodes, ['code', 'currency', 'countries'], to);
		if (toCurrency) {
			toCode = toCurrency.code;
		}

		if (fromCode in currency.rates) {
			if (!(toCode in currency.rates)) {
				return responder.error('currency.invalidTarget', toCode).send();
			}

			const converted = units * this.getRate(fromCode, toCode, currency);

			const fromFormed = new Intl.NumberFormat('en-AU', {
				style: 'currency',
				currency: fromCode,
			}).format(units);

			const toFormed = new Intl.NumberFormat('en-AU', {
				style: 'currency',
				currency: toCode,
			}).format(converted);

			return responder
				.text('currency.converted', fromFormed, fromCode, toFormed, toCode)
				.send();
		}

		const possible = convert().possibilities();

		if (!possible.includes(from)) {
			from = possible.find(t => t.toLowerCase() === from.toLowerCase());

			if (!from) {
				return responder.error('other.unknownInput').send();
			}
		}

		if (!possible.includes(to)) {
			to = possible.find(t => t.toLowerCase() === to.toLowerCase());

			if (!to) {
				return responder.error('other.unknownOutput').send();
			}
		}

		const converted = convert(units).from(from).to(to).toFixed(2);

		return responder.text('other.converted', units, from, converted, to).send();
	}

	getRate(from, to, { base, rates }) {
		if (!rates[to] || !rates[from]) {
			throw new Error('Invalid currency');
		}

		if (from === base) {
			return rates[to];
		}

		if (to === base) {
			return 1 / rates[from];
		}

		return rates[to] * (1 / rates[from]);
	}

	async getCurrencies() {
		const cached = await cache.get('currencies');

		if (cached) {
			return cached;
		}

		const { body } = await superagent.get('https://api.exchangeratesapi.io/latest');

		body.rates[body.base] = 1;

		// cache for 5 minutes
		await cache.set('currencies', body, 300);

		return body;
	}
};

module.exports.info = {
	name: 'convert',
	examples: [
		'1lb kg',
		'10gb mb',
		'1 usd aud',
		'12,000gb to mb',
		'1000mm cm',
		'10eur usd',
		'1.75l ml',
	],
};
