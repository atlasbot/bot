module.exports = (Eris) => {
	Eris.User.prototype.createMessage = function createMessage(content, file) {
		return new Promise((resolve, reject) => {
			this.getDMChannel().then((channel) => {
				channel.createMessage(content, file).then(resolve).catch(reject);
			}).catch(reject);
		});
	};
};
