const Command = require('../../../structures/Command.js');

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		// this is essentially the same as "delete" so it uses the same keys
		const responder = new this.Atlas.structs.Responder(msg.channel, (msg.lang || settings.lang), 'playlist.delete');

		if (!args[0]) {
			return responder.error('noArgs').send();
		}

		const playlists = await this.Atlas.DB.get('playlists').find({
			author: msg.author.id,
		});

		if (!playlists.length) {
			return responder.error('noPlaylists').send();
		}

		const query = args.join(' ');
		const playlist = this.Atlas.lib.utils.nbsFuzzy(playlists, [
			'_id',
			'name',
		], query);

		if (!playlist) {
			return responder.error('noneFound', query).send();
		}

		const play = this.Atlas.commands.get('play');

		play.execute(msg, args, {
			settings,
			body: {
				loadType: 'PLAYLIST_LOADED',
				playlistInfo: {
					name: playlist.name,
				},
				tracks: playlist.tracks,
			},
		});
	}
};

module.exports.info = {
	name: 'play',
	aliases: ['queue', 'p'],
	guildOnly: true,
	patronOnly: true,
};
