module.exports = ({ channel }) => channel.topic;

module.exports.info = {
	name: 'channel.topic',
	description: 'Gets the topic of the channel.',
	examples: [{
		input: '{channel.topic}',
		output: 'Welcome to General',
		note: 'This assumes the channel topic is set to "Welcome to General"',
	}],
	dependencies: ['channel'],
};
