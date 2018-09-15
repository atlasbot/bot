module.exports = (Eris) => {
	Object.defineProperty(Eris.Member.prototype, 'bannable', {
		get() {
			const clientMember = this.guild.members.get(this.guild.shard.client.user.id);

			return clientMember.permission.has('banMembers') && this.punishable(clientMember);
		},
		configurable: true,
	});
};

module.exports.deps = ['Member.punishable'];
