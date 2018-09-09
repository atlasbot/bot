const prettyMs = require('pretty-ms');
const os = require('os');
const Command = require('../../structures/Command.js');

module.exports = class Statistics extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		const uptime = prettyMs(this.Atlas.client.uptime, {
			verbose: true,
		});
		const cpuUsage = await this.getCPUUsage();
		const stats = await this.Atlas.ipc.fetchStats();
		const shard = msg.guild ? msg.guild.shard.id + 1 : 1;

		responder.embed({
			thumbnail: {
				url: this.Atlas.client.user.avatarURL || this.Atlas.client.user.defaultAvatarURL,
			},
			fields: [{
				name: 'statistics.embed.guilds.name',
				value: ['statistics.embed.guilds.value', stats.guilds.total.toLocaleString()],
				inline: true,
			}, {
				name: 'statistics.embed.users.name',
				value: ['statistics.embed.users.value', stats.users.toLocaleString()],
				inline: true,
			}, {
				name: 'statistics.embed.commands.name',
				value: ['statistics.embed.commands.value', this.Atlas.commands.size],
				inline: true,
			}, {
				name: 'statistics.embed.uptime.name',
				value: ['statistics.embed.uptime.value', uptime],
				inline: true,
			}, {
				name: 'statistics.embed.voice.name',
				value: [`statistics.embed.voice.value.${stats.voiceChannels !== 1 ? 'plural' : 'singular'}`, stats.voiceChannels],
				inline: true,
			}, {
				name: 'statistics.embed.cpu.name',
				value: ['statistics.embed.cpu.value', cpuUsage.toFixed(1)],
				inline: true,
			}, {
				name: 'statistics.embed.shard.name',
				value: ['statistics.embed.shard.value', shard, stats.cradle.shardCount],
				inline: true,
			}, {
				name: 'statistics.embed.cluster.name',
				value: ['statistics.embed.cluster.value', this.Atlas.clusterID, stats.clusters.active + 1],
				inline: true,
			}],
			timestamp: new Date(),
		}).send();
	}

	async getCPUUsage() {
		const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

		let [timeUsed0, timeIdle0, timeUsed1, timeIdle1] = [0, 0, 0, 0];

		const cpu0 = os.cpus();
		await sleep(1000);
		const cpu1 = os.cpus();

		for (const cpu of cpu1) {
			timeUsed1 += cpu.times.user + cpu.times.nice + cpu.times.sys;
			timeIdle1 += cpu.times.idle;
		}
		for (const cpu of cpu0) {
			timeUsed0 += cpu.times.user + cpu.times.nice + cpu.times.sys;

			timeIdle0 += cpu.times.idle;
		}

		const totalUsed = timeUsed1 - timeUsed0;
		const totalIdle = timeIdle1 - timeIdle0;

		return (totalUsed / (totalUsed + totalIdle)) * 100;
	}
};

module.exports.info = {
	name: 'statistics',
	description: 'info.statistics.description',
	fullDescription: 'info.statistics.fullDescription',
	aliases: [
		'stats',
	],
};
