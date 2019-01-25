const Cache = require('atlas-lib/lib/structures/Cache');

module.exports = {
	users: new Cache('users'),
	guilds: new Cache('guilds'),
	channels: new Cache('channels'),
	members: new Cache('members'),
	settings: new Cache('settings'),
	userGuilds: new Cache('userGuilds'),
};
