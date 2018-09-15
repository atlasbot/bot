module.exports = (Eris) => {
	Object.defineProperty(Eris.Guild.prototype, 'me', {
		get() {
			return this.members.get(this.shard.client.user.id);
		},
		configurable: true,
	});
};
