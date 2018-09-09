module.exports = class Tag {
	constructor(info) {
		this.info = {
			description: 'This tag has no description!',
			name: 'no_name',
			limit: 25,
			aliases: [],
			usage: '',
			examples: [{
				input: 'No example input :c',
				output: 'No example output :c',
			}],
			...info,
		};
	}

	limit(num = this.info.limit) {
		this.info.limit = num;

		return this;
	}

	execute(func) {
		this.handler = func;

		return this;
	}
};
