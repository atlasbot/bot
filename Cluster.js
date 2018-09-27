const path = require('path');
const { Manager } = require('./sharding');

require('dotenv').config();

/*
	At some point, as far as I know with (limited) knowledge, this will all be
	replaced by basically having an external service managing all clusters and have
	containers for each individual cluster, then let eris internal sharding cover
	the difference between clusters

	or something, idk it's 5am i could be hallucinating for all i know
*/

new Manager(process.env.TOKEN, path.join(__dirname, './Atlas.js'), { // eslint-disable-line no-new
	guildsPerShard: 1500,
	clientOptions: {
		restMode: true,
		disableEvents: {
			USER_SETTINGS_UPDATE: true,
			USER_NOTE_UPDATE: true,
			RELATIONSHIP_ADD: true,
			RELATIONSHIP_REMOVE: true,
			TYPING_START: true,
		},
		defaultFormat: 'png',
		defaultImageSize: 256,
		disableEveryone: true,
		defaultImageFormat: 'png',
	},
});
