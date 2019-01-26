const xputil = require('atlas-lib/lib/xputil');
const middleware = require('./middleware');

module.exports = middleware(async ({ user, guild, Atlas }) => {
	if (user.bot) {
		throw new Error('Bots cannot have XP profiles.');
	}

	const profile = await Atlas.DB.getUser(user);

	const { xp } = profile.guildProfile(guild.id);

	const xpProfile = xputil.getUserXPProfile(xp);

	return xpProfile.remaining;
});

module.exports.info = {
	name: 'user.remainingXP',
	description: 'Gets the remaining XP until the user levels up.',
	args: '<user>',
	examples: [{
		input: '{user.remainingXP}',
		output: '1',
	}, {
		input: '{user.remainingXP}',
		output: '2016',
	}],
	dependencies: ['user', 'guild'],
};
