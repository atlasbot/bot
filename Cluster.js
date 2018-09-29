const path = require('path');
const { Manager } = require('./src/sharding');

require('dotenv').config();

new Manager(process.env.TOKEN, path.join(__dirname, './Atlas.js'), { // eslint-disable-line no-new
	guildsPerShard: 2000,
	clientOptions: {
		restMode: true,
		disableEvents: {
			TYPING_START: true,
		},
	},
});
