// todo: parse then check instead of parsing all of them then checking each one

module.exports = () => '';

module.exports.info = {
	name: 'note',
	args: '*',
	description: 'Returns nothing, useful for notes.',
	examples: [{
		input: '{note;Wew some super secret text :)}',
		output: '',
	}],
	dependencies: [],
};
