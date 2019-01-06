const xputil = require('atlas-lib/lib/xputil');
const middleware = require('./middleware');

module.exports = middleware(async ({ user, guild, Atlas }) => {
	if (user.bot) {
		throw new Error('Bots cannot have XP profiles.');
	}

	const profile = await Atlas.DB.user(user.id);

	const guildProfile = profile.guilds.find(({ id }) => id === guild.id);
	const xp = guildProfile ? guildProfile.xp : 0;

	const xpProfile = xputil.getUserXPProfile(xp);

	return xpProfile.next.xp;
});

module.exports.info = {
	name: 'user.nextLevelXP',
	description: 'Gets the user\'s next level\'s xp required to level up to it.',
	args: '<user>',
	examples: [{
		input: '{user.nextLevelXP}',
		output: '155',
	}],
	dependencies: ['user', 'guild'],
};
