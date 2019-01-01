// backwards compatibility for v7
module.exports = async ({ msg }) => msg.delete().catch(() => false);

module.exports.info = {
	name: 'delete',
	description: 'Deletes the message in context.',
	examples: [{
		input: '{delete}',
		output: '',
		note: 'The invocation message would have been deleted if we had permission to.',
	}],
	dependencies: ['msg'],
};
