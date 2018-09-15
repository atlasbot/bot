module.exports = Eris => {
	Object.defineProperty(Eris.Member.prototype, 'tag', {
		get: function() {
			return `${this.username}#${this.discriminator}`;
		},
	});
};
