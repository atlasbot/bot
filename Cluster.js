const path = require('path');
const { Manager } = require('./src/sharding');

if (!process.env.TOKEN) {
	require('dotenv').config();
} else {
	console.warn('"token" environment variable already set - not loading .env file.');
}

new Manager(process.env.TOKEN, path.join(__dirname, './Atlas.js'), { // eslint-disable-line no-new
	guildsPerShard: 1750,
	clientOptions: {
		// atlas uses rest mode for fetching users from ID's, among other things
		restMode: true,
		// permformance reasons
		// i am leaving that typo if you're wondering
		disableEvents: {
			TYPING_START: true,
			USER_NOTE_UPDATE: true,
			RELATIONSHIP_ADD: true,
			RELATIONSHIP_REMOVE: true,
		},
		// transparent avatars look gross with the default jpg format
		defaultImageFormat: 'png',
		// for embed thumbnails it looks kinda gross <256
		defaultImageSize: 256,
	},
});
