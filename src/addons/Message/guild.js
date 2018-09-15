module.exports = Eris => {
	Object.defineProperty(Eris.Message.prototype, 'guild', {
		get: function() {
			return this.channel.guild;
		},
	});
};
