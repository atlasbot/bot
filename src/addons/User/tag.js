module.exports = Eris => {
	Object.defineProperty(Eris.User.prototype, 'tag', {
		get: function() {
			return `${this.username}#${this.discriminator}`;
		},
	});
};
