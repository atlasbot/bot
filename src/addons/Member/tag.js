module.exports = (Eris) => {
	Object.defineProperty(Eris.Member.prototype, 'tag', {
		get() {
			return `${this.username}#${this.discriminator}`;
		},
		configurable: true,
	});
};
