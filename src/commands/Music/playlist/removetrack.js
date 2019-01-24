const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Responder(msg.channel, (msg.lang || settings.lang), 'playlist.removetrack');

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		if (!args[1]) {
			return responder.error('noQuery').send();
		}

		const playlists = await this.Atlas.DB.get('playlists').find({
			author: msg.author.id,
		});

		if (!playlists.length) {
			return responder.error('noPlaylists').send();
		}

		const query = args[0];
		const playlist = this.Atlas.lib.utils.nbsFuzzy(playlists, [
			'_id',
			'name',
		], query);

		if (!playlist) {
			return responder.error('noneFound', query).send();
		}

		const trackQuery = args.slice(1).join(' ');
		const track = this.Atlas.lib.utils.nbsFuzzy(playlist.tracks, ['info.title', 'info.identifier'], trackQuery, {
			matchPercent: 0.60,
		});

		if (!track) {
			return responder.error('noTrack', trackQuery).send();
		}

		await this.Atlas.DB.get('playlists').update({
			author: msg.author.id,
			_id: playlist._id,
		}, {
			$pull: {
				tracks: {
					_id: track._id,
				},
			},
		});

		return responder.text('success', this.Atlas.lib.utils.filterTrackName(track.info.title), playlist.name).send();
	}
};

module.exports.info = {
	name: 'removetrack',
	aliases: ['remove', 'deltrack'],
	examples: [
		'never gonna give you up',
	],
	guildOnly: true,
	patronOnly: true,
};
