module.exports = Eris => {
	Object.defineProperty(Eris.Guild.prototype, 'client', {
		get: function() {
			return this.shard.client;
		},
	});
};
