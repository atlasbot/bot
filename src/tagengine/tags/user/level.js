const xputil = require('atlas-lib/lib/xputil');
const middleware = require('./middleware');

module.exports = middleware(async ({ user, guild, Atlas }) => {
	if (user.bot) {
		throw new Error('Bots cannot have XP profiles.');
	}

	const profile = await Atlas.DB.user(user);

	const guildProfile = profile.guilds.find(({ id }) => id === guild.id);
	const xp = guildProfile ? guildProfile.xp : 0;

	const xpProfile = xputil.getUserXPProfile(xp);

	return xpProfile.current.level;
});

module.exports.info = {
	name: 'user.level',
	description: 'Gets the users level.',
	args: '<user>',
	examples: [{
		input: '{user.level}',
		output: '1',
	}],
	dependencies: ['user', 'guild'],
};
