module.exports = (Eris) => {
	Eris.Member.prototype.punishable = function punishable(member2) {
		if (this.id === member2.id) {
			return false;
		}
		if (this.id === this.guild.ownerID) {
			return false;
		}
		if (member2.id === this.guild.ownerID) {
			return true;
		}

		return !this.highestRole || !this.highestRole.higherThan(member2.highestRole);
	};
};

module.exports.deps = ['Role.higherThan', 'Member.highestRole'];
