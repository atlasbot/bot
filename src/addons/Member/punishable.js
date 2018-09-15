module.exports = Eris => {
	Eris.Member.prototype.punishable = function(member2) {
		if (this.id === member2.id) return false;
		else if (this.id === this.guild.ownerID) return false;
		else if (member2.id === this.guild.ownerID) return true;
		else return !this.highestRole || !this.highestRole.higherThan(member2.highestRole);
	};
};

module.exports.deps = ['Role.higherThan', 'Member.highestRole'];
