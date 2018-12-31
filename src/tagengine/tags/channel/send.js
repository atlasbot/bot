const TagError = require('../../TagError');
const Responder = require('../../../structures/Responder');

// this tag does some weirdness to handle forwarding tags
module.exports = async (context, args) => {
	const { guild, parseArgs, Atlas } = context;

	let channel;
	if (args[1]) {
		const channelQuery = await parseArgs(args[1]);

		channel = await Atlas.util.findRoleOrChannel(guild, channelQuery, {
			type: 'channel',
		});

		if (!channel) {
			throw new TagError('Invalid channel query.');
		}
	} else {
		({ channel } = context);
	}

	if (channel.type !== 0) {
		throw new TagError('This tag only works for text channels.');
	}

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

		throw new TagError('No content to send.');
	}

	const responder = new Responder(channel, 'en');

	await responder.channel(channel).localised(true).text(content).send();
};

module.exports.info = {
	name: 'channel.send',
	description: 'Sends a message to the channel.',
	args: '[content] <channel>',
	examples: [{
		input: '{channel.send;ayyy}',
		output: 'ayyy',
	}, {
		input: '{channel.send;ayyy;#general}',
		output: 'ayyy',
		note: 'Output would be sent to the #general channel, regardless of where it was called.',
	}],
	dependencies: ['channel'],
	dontParse: true,
};
