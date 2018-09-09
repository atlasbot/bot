const path = require('path');
const { Master } = require('eris-sharder');

require('dotenv').config();

new Master(process.env.TOKEN, path.join(__dirname, './Atlas.js'), { // eslint-disable-line no-new
	guildsPerShard: 1500,
	loadBeforeReady: false,
	clientOptions: {
		restMode: true,
		disableEvents: {
			MEMBER_PRUNE: true,
			MEMBER_ROLE_UPDATE: true,
			MEMBER_BAN_ADD: true,
			MEMBER_BAN_REMOVE: true,
			WEBHOOK_CREATE: true,
			WEBHOOK_UPDATE: true,
			WEBHOOK_DELETE: true,
			CHANNEL_OVERWRITE_CREATE: true,
			CHANNEL_OVERWRITE_UPDATE: true,
			CHANNEL_OVERWRITE_DELETE: true,
			CHANNEL_PINS_UPDATE: true,
			USER_SETTINGS_UPDATE: true,
			USER_NOTE_UPDATE: true,
			RELATIONSHIP_ADD: true,
			RELATIONSHIP_REMOVE: true,
			GUILD_BAN_ADD: true,
			GUILD_BAN_REMOVE: true,
			TYPING_START: true,
		},
		defaultFormat: 'png',
		defaultImageSize: 256,
		disableEveryone: true,
		defaultImageFormat: 'png',
	},
});
