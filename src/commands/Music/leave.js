const Command = require('../../structures/Command.js');

/*
	This whole command is setup in a way that means even if Atlas isn't technically playing anything
	it should be able to get the bot to leave
*/
module.exports = class Leave extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, { // eslint-disable-line no-unused-vars
		settings, // eslint-disable-line no-unused-vars
	}) {
		const responder = new this.Atlas.structs.Responder(msg);

		// the voice channel the user is in
		const userVC = msg.channel.guild.channels.get(msg.member.voiceState.channelID);
		// the voice channel Atlas is in
		const myVC = msg.channel.guild.channels.get(msg.guild.me.voiceState.channelID);

		// if they aren't in the same VC as atlas and the VC isn't empty, then say no.
		if (myVC && !myVC.voiceMembers.find(m => m.id === msg.author.id) && myVC.voiceMembers.some(m => !m.bot)) {
			return responder.error('leave.sameChannel').send();
		}

		const p = await this.Atlas.client.voiceConnections.getPlayer(userVC, false);
		const entry = this.Atlas.client.voiceConnections.get(msg.guild.id);

		if (!p && !entry && !myVC) {
			// if atlas has restarted, sometimes there will be a "ghost" in the channel because discord
			// hasn't updated clients yet, but to Atlas it isn't in the channel.
			if (this.Atlas.client.uptime < (5 * 60 * 1000)) {
				const uptime = this.Atlas.lib.utils.prettyMs(this.Atlas.client.uptime, 'milliseconds', { verbose: true });

				return responder.error('leave.recentRestart', uptime).send();
			}

			return responder.error('leave.nothingPlaying').send();
		}

		if (myVC) {
			myVC.leave();
		}

		if (myVC) {
			myVC.leave();
		}

		if (p) {
			// todo: delete player messages to prevent a ton of channel spam
		}

		if (entry) {
			this.Atlas.client.voiceConnections.delete(msg.guild.id);
		}

		// channel is not guaranteed, sometimes there are ghost players that aren't really playing
		if (myVC && myVC.name) {
			return responder.text('leave.leftChannel', myVC.name).send();
		}

		return responder.text('leave.leftNoChannel').send();
	}
};

module.exports.info = {
	name: 'leave',
	aliases: ['stfu', 'gtfo'],
	guildOnly: true,
};
