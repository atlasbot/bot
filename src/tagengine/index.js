const { matchRecursive } = require('xregexp');
const TagError = require('./TagError');

const match = str => matchRecursive(str, '{', '}', 'gmi');

module.exports = class Parser {
	/**
     *
     * @param {Object} data Data for the tags to pull information from
     * @param {Object} data.ticket The ticket to get info from
     * @param {Guild} data.guild The guild to get info from
     * @param {Channel} data.channel The channel to get info from
     * @param {Object} data.command The command that is being processed
     */
	constructor({
		ticket,
		guild,
		channel,
		command,
		settings,
	}) {
		this.data = {
			ticket,
			guild,
			channel,
			command,
			settings,
		};
		this.tags = require('./loader')();
		this.Atlas = require('./../../Atlas');
	}

	async parse(str) {
		// match will get valid tags matching {<anything>}
		// everything else is to remove duplicates because we don't want to parse the same tags multiple times
		const tags = [...(new Set(match(str)))];

		if (!tags[0]) {
			return {
				output: str,
				errors: [],
			};
		}

		const errors = [];
		let parsed = str;

		for (const tag of tags) {
			// splitting math;1+1 would mean the first arg is the variable name, everything after is arguments for it
			const [name, ...unparsedArgs] = tag.split(';');
			let output;

			if (this.tags.has(name)) {
				const { execute, info } = this.tags.get(name);
				if (info.dependencies.length && info.dependencies.some(d => !this.data[d])) {
					// we are missing something the tag relies on
					output = `{${tag}}`;
				} else if (typeof execute === 'function') {
					try {
						if (info.preParse !== false) {
						// parse args
							const args = [];
							for (const arg of unparsedArgs) {
								if (match(arg)) {
									const ret = await this.parse(arg);
									errors.push(...ret.errors);

									args.push(ret.output);
								} else {
									args.push(arg);
								}
							}
							output = await execute(this.data, args);
						} else {
							output = await execute({
								info: this.data,
								parse: e => (match(e) ? this.parse(e) : e),
							}, unparsedArgs);
						}
					} catch (e) {
						if (e instanceof TagError) {
							e.tag(name);

							errors.push(e);
							output = `{${tag}}`;
						} else {
							console.error(e);

							const te = new TagError(`unhandled(${name}): ${e.message}`);
							errors.push(te);
							output = `{${tag}}`;
						}
					}
				} else {
					throw new Error(`Unknown tag type "${typeof execute}"`);
				}
			}

			if (output && typeof output !== 'string') {
				if (output.output) {
					({ output } = output);
				}
			}

			parsed = parsed.split(`{${tag}}`).join(output || '');
		}

		return {
			output: parsed,
			errors,
		};
	}
};
