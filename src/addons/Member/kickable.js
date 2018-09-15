module.exports = (Eris) => {
	Object.defineProperty(Eris.Member.prototype, 'kickable', {
		get() {
			const clientMember = this.guild.members.get(this.guild.shard.client.user.id);

			return clientMember.permission.has('kickMembers') && this.punishable(clientMember);
		},
		configurable: true,
	});
};

module.exports.deps = ['Member.punishable'];
