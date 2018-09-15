module.exports = Eris => {
	Object.defineProperty(Eris.Member.prototype, 'roleObjects', {
		get: function() {
			return this.roles.map(roleID => this.guild.roles.get(roleID));
		},
	});
};
