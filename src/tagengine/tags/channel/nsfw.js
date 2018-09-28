module.exports = ({ channel }) => channel.nsfw;

module.exports.info = {
	name: 'channel.nsfw',
	description: 'Whether or not the current channel is not safe for work.',
	examples: [{
		input: '{channel.nsfw}',
		output: 'false',
		note: 'This assumes the channel is not marked as NSFW.',
	}],
	dependencies: ['channel'],
};
