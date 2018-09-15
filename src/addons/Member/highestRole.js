module.exports = Eris => {
	Object.defineProperty(Eris.Member.prototype, 'highestRole', {
		get: function() {
			if (this.roles.length === 0) return this.guild.roles.get(this.guild.id);
			else return this.roleObjects.reduce((prev, role) => !prev || role.higherThan(prev) ? role : prev);
		},
	});
};

module.exports.deps = ['Role.higherThan', 'Member.roleObjects'];
