const roleColor = require('atlas-lib/lib/utils/roleColor');
const middleware = require('./middleware');

module.exports = middleware(({ user, guild }, [hex = true]) => {
	const member = guild.members.get(user.id);
	const role = member.highestRole;

	if (hex === 'true') {
		return `#${roleColor(role.color)}`;
	}

	return role.color;
}, 1);

module.exports.info = {
	name: 'user.color',
	description: 'Gets the user\'s color, based on their highest role. If <hex=true>, the output will be in hex (#ffffff).',
	args: '<hex=true> <user>',
	examples: [{
		input: '{user.color}',
		output: '#95a5a6',
	}, {
		input: '{user.color;true}',
		output: '9807270',
	}, {
		input: '{user.color;true;Atlas}',
		output: '#03a9f4',
	}],
	dependencies: ['user', 'guild'],
};
