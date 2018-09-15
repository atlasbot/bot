module.exports = (Eris) => {
	Object.defineProperty(Eris.Member.prototype, 'roleObjects', {
		get() {
			return this.roles.map(roleID => this.guild.roles.get(roleID));
		},
		configurable: true,
	});
};
