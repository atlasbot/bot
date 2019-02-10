module.exports = ({ ticket }) => ticket.channel.id || ticket.channel;

module.exports.info = {
	name: 'ticket.channel',
	description: 'Gets the ID of the ticket\'s channel, if one is in context.',
	examples: [{
		input: '{ticket.channel}',
		output: '544275146001743872',
	}],
	dependencies: ['ticket'],
};
