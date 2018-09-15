module.exports = (Eris) => {
	Object.defineProperty(Eris.Guild.prototype, 'client', {
		get() {
			return this.shard.client;
		},
		configurable: true,
	});
};
