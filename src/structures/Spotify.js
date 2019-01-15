const superagent = require('superagent');
const Cache = require('atlas-lib/lib/structures/Cache');

const cache = new Cache('spotify-auth');

/**
 * Handles interactions with Spotify's API
 */
module.exports = class Spotify {
	/**
	 * Spotify constructor
	 */
	constructor() {
		this.clientId = process.env.SPOTIFY_CLIENT_ID;
		this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	}

	/**
	 * Gets an access token from a client_id and client_secret
	 * @private
	 * @returns {Object} the grant
	 */
	async clientCredentialsGrant() {
		// caching it means other shards can also get that juicy token without having to fetch it
		// with 20+ shards this is helpful
		// also i like abusing caching
		const existing = await cache.get('auth');
		if (existing) {
			return existing;
		}

		// fetch the grant
		const { body } = await superagent.post('https://accounts.spotify.com/api/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.set('Authorization', `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`)
			.send({
				grant_type: 'client_credentials',
			});

		// cache the grant until it expires
		await cache.set('auth', body, body.expires_in);

		return body;
	}

	/**
	 * Gets a playlists info
	 * @param {string} id The playlists ID
	 * @param {number} offset The offset of tracks to fetch.
	 * @returns {Object|Array} Array when offset is set
	 */
	async getPlaylist(id) {
		const {
			access_token: accessToken,
			token_type: tokenType,
		} = await this.clientCredentialsGrant();

		const { body } = await superagent.get(`https://api.spotify.com/v1/playlists/${id}`)
			.set('Authorization', `${tokenType} ${accessToken}`);

		if (body.tracks.next) {
			const nextTracks = await this.getPlaylistTracks(body.tracks.next, accessToken, tokenType);

			body.tracks.items.push(...nextTracks);
		}

		return body;
	}

	/**
	 * Gets tracks from a playlist from a "next" url
	 *
	 * @param {string} url The URL with offsets and the playlist ID
	 * @param {string} token The token to use
	 * @param {string} type The type of token (e.g, "Bearer")
	 * @returns {Promise<array>}
	 * @private
	 */
	async getPlaylistTracks(url, token, type) {
		const { body: { items, offset, next: nextUrl } } = await superagent.get(url)
			.set('Authorization', `${type} ${token}`);

		if (nextUrl && offset < 300) {
			const next = await this.getPlaylistTracks(nextUrl, token, type);

			return [
				...items,
				...next,
			];
		}

		return items;
	}

	/**
	 * Gets a tracks info
	 * @param {string} id The tracks ID
	 */
	async getTrack(id) {
		const {
			access_token: accessToken,
			token_type: tokenType,
		} = await this.clientCredentialsGrant();

		const { body } = await superagent.get(`https://api.spotify.com/v1/tracks/${id}`)
			.set('Authorization', `${tokenType} ${accessToken}`);

		return body;
	}
};
