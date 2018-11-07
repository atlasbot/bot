const _Agenda = require('agenda');
const Joi = require('joi');

let EventEmitter;
try {
	EventEmitter = require('eventemitter3');
} catch (e) {
	EventEmitter = require('events').EventEmitter; // eslint-disable-line prefer-destructuring
}

module.exports = class Agenda extends EventEmitter {
	constructor(connectUri) {
		super();
		this.connect_uri = connectUri || process.env.MONGO_URI;
		this.ready = false;

		this.reminderSchema = require('./schemas/reminder');
		this.muteSchema = require('./schemas/mute');
		this.Atlas = require('./../Atlas');
		this.agenda = null;

		this.graceful = (async (stop) => {
			console.info('Gracefully shutting down Agenda...');

			if (this.agenda) {
				await this.agenda.stop();
			}

			process.removeListener('SIGTERM', this.graceful);
			process.removeListener('SIGINT', this.graceful);

			if (stop === true) {
				return process.exit(0);
			}
		});
	}

	/**
	 * Connect Agenda to the database
	 * @returns {void}
	 */
	connect() {
		this.agenda = new _Agenda({
			db: {
				address: this.connect_uri,
				options: {
					useNewUrlParser: true,
				},
			},
		});

		this.agenda.on('ready', () => {
			this.ready = true;
			this.emit('ready');
			this.agenda.start();

			return console.info('Agenda is ready');
		});

		this.agenda.define('reminder', async (job, done) => {
			const { user, message, requested, lang } = job.attrs.data;
			// get the DM channel of the user
			const channel = await this.Atlas.client.getDMChannel(user);

			// todo: lang should be fetched from guild incase it's been changed (or default to the users preference if it's set)
			const responder = new this.Atlas.structs.Responder(channel, lang || 'en');

			// todo: localisation
			const embed = {
				title: 'Reminder',
				description: `"${message}"`,
				timestamp: requested,
				footer: {
					text: 'Requested',
				},
			};
			try {
				await responder.embed(embed).send();

				return done();
			} catch (e) {
				embed.footer.text = 'Open your direct-message to have this direct-messaged to you - Requested';
				await responder
					.channel(job.attrs.data.channel)
					.text(`<@${user}>`)
					.send();

				return done();
			}
		});

		this.agenda.define('unmute', async (job) => {
			const { target, role, guild } = job.attrs.data;
			let member;
			if (this.Atlas.client.guilds.has(guild)) {
				const g = this.Atlas.client.guilds.get(guild);
				if (!g.roles.has(role)) return;
				member = g.members.get(target);
			} else {
				member = await this.Atlas.client.getRESTGuildMember(guild, target);
			}
			if (member.roles.includes(role)) {
				return this.Atlas.client.removeGuildMemberRole(guild, target, role, 'Auto-unmute');
			}
		});

		process.on('SIGTERM', this.graceful);
		process.on('SIGINT', this.graceful);
	}

	/**
	 * Schedule a job
	 * @param {string} type the type of job
	 * @param {Date} when When the job should run
	 * @param {Object} attrs the attributes to add to the job
	 * @returns {Promise<Job|Error>} The saved job or the error which cocured saving the job.
	 */
	async schedule(type, when, attrs) {
		if (!this.ready) {
			throw new Error('Not ready');
		} if (type === 'reminder') {
			const ret = Joi.validate(attrs, this.reminderSchema, {
				abortEarly: false,
			});
			if (ret.error) {
				throw new Error(ret.error);
			}

			const job = this.agenda.create('reminder', attrs);

			await job.schedule(when).save();

			return job;
		} if (type === 'unmute') {
			const ret = Joi.validate(attrs, this.muteSchema, {
				abortEarly: false,
			});
			if (ret.error) {
				throw new Error(ret.error);
			}

			const job = this.agenda.create('unmute', attrs);

			await job.schedule(when).save();

			return job;
		}

		throw new Error(`Invalid schedule type "${type}"!`);
	}
};
