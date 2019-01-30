const _Agenda = require('agenda');
const Joi = require('joi');

const { EventEmitter } = require('events');

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
			console.info('Gracefully shutting down Agenda..');

			if (this.agenda) {
				await this.agenda.stop();
			}

			process.removeListener('SIGTERM', this.graceful);
			process.removeListener('SIGINT', this.graceful);

			if (stop === true) {
				return process.exit(0);
			}
		});

		this.connect();
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

			return console.log('Agenda has started.');
		});

		this.agenda.define('reminder', async (job, done) => {
			const { user, message, requested, lang } = job.attrs.data;
			// get the DM channel of the user
			const responder = new this.Atlas.structs.Responder(null, lang || 'en');

			const embed = {
				title: 'general.reminder.title',
				description: `"${message}"`,
				timestamp: requested,
				footer: {
					text: 'general.reminder.footer',
				},
			};

			try {
				// try their direct-messages first
				await responder.dm(user).embed(embed).send();

				return done();
			} catch (e) {
				// if their DM's aren't open, fall back to the channel it was created at
				embed.footer.text = 'Open your direct-message to have this direct-messaged to you - Requested';

				await responder
					.channel(job.attrs.data.channel)
					.text(`<@${user}>`)
					.send();

				return done();
			}
		});

		this.agenda.define('unmute', async (job, done) => {
			const { target: targetID, role: muteRoleID, guild: guildID } = job.attrs.data;
			const guild = this.Atlas.client.guilds.get(guildID);

			if (!guild || !guild.me.permission.has('manageRoles')) {
				return;
			}

			const muteRole = guild.roles.get(muteRoleID);
			if (!muteRole) {
				return;
			}

			const target = await this.Atlas.util.findUser(guild, targetID, {
				memberOnly: true,
			});

			if (!target || !(target.roles || []).includes(muteRole.id)) {
				return;
			}

			await this.Atlas.client.removeGuildMemberRole(guildID, targetID, muteRole.id, 'Auto-unmute');

			return done();
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
