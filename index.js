/**
 * Bootstraps Atlas begins startup
 *
 * Previously a sharder handler would do this, but now Atlas has gotten it's big boy pants on and a sharder manager isn't needed.
 * This is essentially just calling Atlas with an Eris client
 */

const logger = require('atlas-lib/lib/logger');

// load environment variables from ./.env
require('dotenv').config();

logger.config(true);

const Eris = require('eris');

const Atlas = require('./Atlas');
const autoscale = require('./src/autoscale');

(async () => {
	const { total, mine } = await autoscale();

	console.log(`Shard ${mine}, total ${total}`);

	const client = new Eris.Client(process.env.TOKEN, {
	// atlas uses rest mode for fetching users from ID's, among other things
		restMode: true,
		// performance reasons
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
		maxShards: total,
		firstShardID: mine,
		lastShardID: mine,
	});

	const atlas = new Atlas({ client });

	atlas.launch();

	client.connect();
})();
