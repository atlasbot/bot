const Command = require('../../structures/Command.js');

/*
	This whole command is setup in a way that means even if Atlas isn't technically playing anything
	it should be able to get the bot to leave
*/
const FIVE_MINUTES = 5 * 60 * 1000;

module.exports = class Leave extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg) {
		const responder = new this.Atlas.structs.Responder(msg, msg.lang, 'leave');

		// the voice channel the user is in
		const userVC = msg.channel.guild.channels.get(msg.member.voiceState.channelID);
		// the voice channel Atlas is in
		const myVC = msg.channel.guild.channels.get(msg.guild.me.voiceState.channelID);

		// if they aren't in the same VC as atlas and the VC isn't empty, then say no.
		if (myVC && !myVC.voiceMembers.find(m => m.id === msg.author.id) && myVC.voiceMembers.some(m => !m.bot)) {
			return responder.error('sameChannel').send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(userVC, false);
		const entry = this.Atlas.client.voiceConnections.get(msg.guild.id);

		if (!player && !entry && !myVC) {
			// if atlas has restarted, sometimes there will be a "ghost" in the channel because discord
			// hasn't updated clients yet, but to Atlas it isn't in the channel.
			if (this.Atlas.client.uptime < FIVE_MINUTES) {
				const uptime = this.Atlas.lib.utils.prettyMs(this.Atlas.client.uptime, 'milliseconds', { verbose: true });

				return responder.error('recentRestart', uptime).send();
			}

			return responder.error('nothingPlaying').send();
		}

		if (myVC) {
			await myVC.leave();
		}

		if (player) {
			player.responder.clean(msg.channel.id);
		}

		if (entry) {
			this.Atlas.client.voiceConnections.delete(msg.guild.id);
		}

		// channel is not guaranteed, sometimes there are ghost players that aren't really playing
		if (myVC && myVC.name) {
			return responder.text('leftChannel', myVC.name).send();
		}

		return responder.text('leftNoChannel').send();
	}
};

module.exports.info = {
	name: 'leave',
	aliases: ['stfu', 'gtfo'],
	guildOnly: true,
};
