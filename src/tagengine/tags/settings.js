const TagError = require('../TagError');

module.exports = async ({ settings, Atlas }, [key]) => {
	if (!key) {
		throw new TagError('"key" should be a string.');
	}

	const data = Atlas.lib.utils.getNested(settings.raw, key);

	if (!data) {
		return;
	}

	return JSON.stringify(data).replace(/^"(.*)"$/, '$1');
};

module.exports.info = {
	name: 'settings',
	args: '<key>',
	description: 'Gets a raw setting value. This is an advanced command, if you don\'t understand how to use it or what it does, then you probably shouldn\'t be using it.',
	examples: [{
		input: '{settings;prefix}',
		output: 'a!',
	}, {
		input: '{settings;plugins.moderation.state}',
		output: 'enabled',
	}],
	dependencies: ['settings'],
};
