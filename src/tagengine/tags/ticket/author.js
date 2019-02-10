module.exports = ({ ticket }) => ticket.author;

module.exports.info = {
	name: 'ticket.author',
	description: 'Gets the ID of the ticket\'s author, if one is in context.',
	examples: [{
		input: '{ticket.author}',
		output: '111372124383428608',
	}],
	dependencies: ['ticket'],
};
