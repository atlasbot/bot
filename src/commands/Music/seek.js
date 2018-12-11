const Command = require('../../structures/Command.js');
const parseTime = require('../../../lib/utils/parseTime');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action({
		channel,
		member,
		guild,
		lang,
	}, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(channel, (lang || settings.lang), 'seek');

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		const voiceChannel = guild.channels.get(guild.me.voiceState.channelID);
		if (!voiceChannel) {
			return responder.error('general.player.none').send();
		}

		const player = await this.Atlas.client.voiceConnections.getPlayer(voiceChannel, false);
		if (!player || !player.isPlaying || !player.track) {
			return responder.error('general.player.none').send();
		}

		if (voiceChannel.id !== member.voiceState.channelID) {
			return responder.error('general.player.sameVoiceChannel').send();
		}

		let ms = 0;
		const input = args.join(' ');
		if (isFinite(input)) {
			// input is assumed to be seconds
			ms = Number(input) * 1000;
		} else {
			const parsed = parseTime(input);
			if (parsed) {
				ms = parsed.relative;
			}
		}

		if (!ms || ms < 0) {
			return responder.error('noTimestamp').send();
		}

		if (ms > player.track.info.length) {
			return responder.error('overTrackLength', this.Atlas.lib.utils.prettyMs(player.track.info.length, {
				verbose: false,
			}));
		}

		await player.seek(ms);

		return responder.text('seeked', this.Atlas.lib.utils.prettyMs(ms)).send();
	}
};

module.exports.info = {
	name: 'seek',
	examples: [
		'180',
		'180 seconds',
		'3 minutes',
	],
	guildOnly: true,
};
