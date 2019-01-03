const middleware = require('./middleware');
const TagError = require('../../TagError');
const Responder = require('../../../structures/Responder');

// this tag does some weirdness to handle forwarding tags
module.exports = middleware(async (context, args) => {
	const { user, parseArgs } = context;

	try {
		const channel = await user.getDMChannel();

		// run child tags with custom context so, for example, {a!ae} sends it to the forwarded channel.
		const [content] = await parseArgs([args[0]], {
			...context,
			channel,
			msg: context.msg && {
				...context.msg,
				channel,
			},
		});

		if (!content) {
			if (args[0]) {
				// tag was parsed and probably executed correctly
				return;
			}

			throw new TagError('Missing something to send');
		}

		const responder = new Responder(channel, 'en');

		await responder.channel(channel).localised(true).text(content).send();
	} catch (e) {
		console.warn(e);
		throw new Error('User\'s direct-messages are not open.');
	}
}, 1);

module.exports.info = {
	name: 'user.send',
	description: 'Direct-messages a user a message.',
	args: '[message] <user>',
	examples: [{
		input: '{user.send;Hello :)}',
		output: '',
		note: 'This tag does not output anything on success.',
	}, {
		input: '{user.send;Hello :)}',
		output: '{user.send-ERROR1}',
		note: 'This tag will throw an error if the user\'s direct-messages are not open.',
	}],
	dependencies: ['user'],
	dontParse: true,
};
