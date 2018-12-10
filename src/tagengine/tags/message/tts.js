const middleware = require('./middleware');

module.exports = middleware(({ msg }) => msg.tts);

module.exports.info = {
	name: 'message.tts',
	description: 'Returns true/false on whether the message uses text-to-speech or not.',
	args: '<message id> <message channel>',
	examples: [{
		input: '{message.tts}',
		output: 'false',
		note: 'thank god',
	}],
	dependencies: ['msg'],
};
