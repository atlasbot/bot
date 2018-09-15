module.exports = (Eris) => {
	Object.defineProperty(Eris.Message.prototype, 'guild', {
		get() {
			return this.channel.guild;
		},
		configurable: true,
	});
};
