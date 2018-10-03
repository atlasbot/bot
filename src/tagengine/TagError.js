// todo
module.exports = class TagError extends Error {
	constructor(raw, {
		docRef,
	} = {}) {
		super(raw);

		this.docRef = docRef;
	}

	tag(name) {
		this.message = `${name }: ${this.message}`;
	}
};
