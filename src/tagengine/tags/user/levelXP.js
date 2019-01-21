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

	return xpProfile.current.xp;
});

module.exports.info = {
	name: 'user.levelXP',
	description: 'Gets the user\'s XP count.',
	args: '<user>',
	examples: [{
		input: '{user.levelXP}',
		output: '54',
	}, {
		input: '{user.levelXP}',
		output: '1348',
	}],
	dependencies: ['user', 'guild'],
};
