const Command = require('../../../structures/Command.js');

const TRACKS_PREVIEW_SIZE = 4;

module.exports = class extends Command {
	constructor(Atlas) {
		super(Atlas, module.exports.info);
	}

	async action(msg, args, {
		settings,
	}) {
		const responder = new this.Atlas.structs.Paginator(msg.channel, (msg.lang || settings.lang), 'playlist.list');

		const playlists = await this.Atlas.DB.get('playlists').find({
			author: msg.author.id,
		});

		if (!playlists.length) {
			return responder.error('noPlaylists').send();
		}

		// lets the user view info about a specific playlist
		let page = 1;
		if (args[0]) {
			const playlist = this.Atlas.lib.utils.nbsFuzzy(playlists, ['name', '_id'], args.join(' '));

			if (playlist) {
				page = playlists.findIndex(p => p._id === playlist._id) + 1;
			}
		}

		return responder.paginate({
			user: msg.author.id,
			total: playlists.length,
			startAndEndSkip: false,
			page,
		}, (paginator) => {
			const playlist = playlists[paginator.page.current - 1];

			const duration = playlist.tracks.reduce((a, b) => a + b.info.length, 0);

			let trackField = playlist.tracks.slice(0, TRACKS_PREVIEW_SIZE).map((track, i) => `${i + 1}. [${this.Atlas.lib.utils.filterTrackName(track.info.title)}](${track.info.uri})`).join('\n');
			if (playlist.tracks.length > TRACKS_PREVIEW_SIZE) {
				trackField += `\n  ${responder.format('more', playlist.tracks.length = TRACKS_PREVIEW_SIZE)}`;
			}

			// we're displaying the subreddit info
			return {
				author: {
					name: playlist.name,
					icon_url: msg.author.avatarURL,
				},
				description: ['description', playlist.tracks.length],
				fields: [{
					name: 'duration',
					value: this.Atlas.lib.utils.prettyMs(duration),
					inline: true,
				}, {
					name: 'created',
					value: this.Atlas.lib.utils.timeFormat(playlist.createdAt),
					inline: true,
				}, {
					name: 'updated',
					value: this.Atlas.lib.utils.timeFormat(playlist.updatedAt),
					inline: true,
				}, {
					name: 'tracks',
					value: trackField,
				}],
				timestamp: new Date(),
				footer: {
					text: ['footer', playlist._id, paginator.page.current, paginator.page.total],
				},
			};
		}).send();
	}
};

module.exports.info = {
	name: 'list',
	aliases: ['view'],
	examples: [
		'my epic playlist',
	],
	guildOnly: true,
	patronOnly: true,
};
