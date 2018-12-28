class Token {
	constructor(type, value) {
		return {
			type,
			value: typeof value === 'string' ? value.trim() : value,
		};
	}
}

module.exports = Token;
