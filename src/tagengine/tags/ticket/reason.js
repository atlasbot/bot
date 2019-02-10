module.exports = ({ ticket }) => ticket.reason;

module.exports.info = {
	name: 'ticket.reason',
	description: 'Gets the reason of the ticket, if one is in context.',
	examples: [{
		input: '{ticket.reason}',
		output: 'Hi my name jef i really need help finding better memes thank u',
	}],
	dependencies: ['ticket'],
};
