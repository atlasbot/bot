module.exports = (Eris) => {
	Object.defineProperty(Eris.Member.prototype, 'highestRole', {
		get() {
			if (this.roles.length === 0) return this.guild.roles.get(this.guild.id);

			return this.roleObjects.reduce((prev, role) => (!prev || role.higherThan(prev) ? role : prev));
		},
		configurable: true,
	});
};

module.exports.deps = ['Role.higherThan', 'Member.roleObjects'];
