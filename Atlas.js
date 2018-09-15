const Raven = require('raven');
const path = require('path');
const Eris = require('eris');

const lib = require('./lib');
const Util = require('./src/util');
const Agenda = require('./src/agenda');
const cmdUtil = require('./src/commands');
const structs = require('./src/structures');
const EPM = require('./src/structures/ExtendedPlayerManager');
const ExtendedPlayer = require('./src/structures/ExtendedPlayer');

const DB = lib.structs.Database;
// load eris addons cus lazy
lib.utils.walkSync(path.join(__dirname, 'src/addons'))
	.filter(a => a.endsWith('.js'))
	.forEach((a) => {
		const Prop = require(a);
		Prop(Eris);
	});

module.exports = class Atlas {
	constructor({
		bot,
		clusterID,
	}) {
		module.exports = this;

		this.util = (new Util(this));
		this.Raven = Raven;
		this.client = bot;
		this.structs = structs;
		this.clusterID = clusterID;

		this.eventFunctions = {};
		this.events = [
			'messageCreate',
			'messageReactionAdd',
		];

		this.commands = {
			labels: new Map(),
			aliases: new Map(),
			get(label) {
				return this.labels.get(label) || this.labels.get(this.aliases.get(label));
			},
			has(label) {
				return this.labels.has(label) || this.aliases.has(label);
			},
		};

		this.langs = new Map();
		this.plugins = new Map();
		this.agenda = new Agenda();
		this.DB = new DB({
			user: process.env.DB_USER,
			pass: process.env.DB_PASS,
			host: process.env.DB_HOST,
		});
		this.DB.init();

		this.collectors = {
			emojis: {},
		};

		this.colors = require('./src/colors');
		this.version = require('./package.json').version;

		this.lib = lib;
		this.env = process.env.NODE_ENV || 'development';
	}

	/**
	 * Launch the bot,
	 * @param {boolean} reload Whether or not the bot is being reloaded
	 * @returns {void}
	 */
	async launch(reload = false) {
		// setting up sentry when possible
		if (process.env.SENTRY_DSN) {
			Raven.config(process.env.SENTRY_DSN, {
				environment: process.env.NODE_ENV,
				name: 'Atlas',
				release: require('./package.json').version,
				captureUnhandledRejections: true,
				stacktrace: true,
				autoBreadcrumbs: { http: true },
			}).install((err, sendErr, eventId) => {
				if (!sendErr) {
					console.warn(`Successfully sent fatal error with eventId ${eventId} to Sentry`);
				}
			});
		} else {
			console.log('No Sentry DSN found, error reporting will be disabled until the "SENTRY_DSN" environment variable is set.');
		}

		// Loading events
		this.events.forEach((e) => {
			const Handler = require(`./src/events/${e}.js`);
			const handler = new Handler(this);

			this.eventFunctions[e] = handler.execute.bind(handler);
			this.client.on(e, this.eventFunctions[e]);
			console.log(`Loaded event handler "${e}"`);
			delete require.cache[require.resolve(`./src/events/${e}.js`)];
		});

		// Loading locales
		const locales = require('./lang.js');
		(await locales.load()).forEach((l) => {
			this.langs.set(l.base.meta.name, l.base);
		});
		console.log(`Loaded ${this.langs.size} languages`);

		// set the bot status
		this.client.editStatus('online', {
			name: `${this.version} "Antares" | Development Version`,
			type: 0,
		});

		// setup the player
		if (!(this.client.voiceConnections instanceof EPM)) {
			this.client.voiceConnections = new EPM(this.client, [
				{
					host: process.env.LAVALINK_HOST,
					port: Number(process.env.LAVALINK_PORT),
					region: 'us',
					password: process.env.LAVALINK_PASS,
				},
			], {
				numShards: this.client.options.maxShards,
				userId: this.client.user.id,
				regions: [],
				defaultRegion: 'us',
				player: ExtendedPlayer,
			});
		}

		// get agenda to connect
		this.agenda.connect();
		// load commands
		cmdUtil.load(this, reload);
	}

	async preReload() {
		for (const key in this.eventFunctions) {
			if ({}.propertyIsEnumerable.call(this.eventFunctions, key)) {
				this.client.removeListener(key, this.eventFunctions[key]);
			}
		}

		await this.agenda.agenda.stop();

		return true;
	}

	/**
	 * Gets a colour
	 * @param {string} name the name of the colour to get
	 * @returns {Object} the color, see ./src/colors for what can be returned
	 */
	color(name) {
		const colour = this.colors.find(m => m.name === name.toUpperCase());
		if (!colour) {
			throw new Error(`Color does not exist with name "${name}"`);
		}

		return parseInt(colour.color.replace(/#/ig, ''), 16);
	}
};
