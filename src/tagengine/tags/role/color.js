const middleware = require('./middleware');
const roleColor = require('../../../../lib/utils/roleColor');

module.exports = middleware(({ role }, [hex = true]) => {
	if (hex === 'true') {
		return `#${roleColor(role.color)}`;
	}

	return role.color;
});

module.exports.info = {
	name: 'role.color',
	description: 'Gets the hex code of a role. If <hex=false>, the color will be in base 10 and may be empty if the role has no color.',
	args: '<hex=true>',
	examples: [{
		input: '{role.color;Developer}',
		output: '#95a5a6',
	}, {
		input: '{role.color;Developer;false}',
		output: '9807270',
	}, {
		input: '{role.color;@everyone}',
		output: '0',
		note: 'The everyone role has no color and cannot have one, so it will always return 0.',
	}],
	dependencies: ['guild'],
};
