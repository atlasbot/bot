module.exports = (Eris) => {
	Object.defineProperty(Eris.User.prototype, 'tag', {
		get() {
			return `${this.username}#${this.discriminator}`;
		},
		configurable: true,
	});
};
