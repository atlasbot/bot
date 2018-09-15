module.exports = Eris => {
	Object.defineProperty(Eris.Member.prototype, 'bannable', {
		get: function() {
			const clientMember = this.guild.members.get(this.guild.shard.client.user.id);

			return clientMember.permission.has('banMembers') && this.punishable(clientMember);
		},
	});
};

module.exports.deps = ['Member.punishable'];
