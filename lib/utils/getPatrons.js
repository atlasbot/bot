const superagent = require('superagent');
const Cache = require('../structures/Cache');

const cache = new Cache('getPatrons');

module.exports = async (page, token = process.env.PATREON_KEY, campaign) => {
	if (!token) {
		throw new Error('No "PATREON_KEY".');
	}

	const lastFetch = await cache.get('lastFetch');
	if (!page && lastFetch) {
		return lastFetch;
	}

	if (!campaign) {
		[campaign] = (await superagent.get('https://www.patreon.com/api/oauth2/api/current_user/campaigns')
			.set('Authorization', `Bearer ${token}`)
			.set('Accept', 'application/json')).body.data;
	}

	const { body } = await superagent.get(page || `https://www.patreon.com/api/oauth2/api/campaigns/${campaign.id}/pledges`)
		.set('Authorization', `Bearer ${token}`)
		.set('Accept', 'application/json');

	let patrons = body.data
		.filter(data => data.type === 'pledge')
		.map((pledge) => {
			const users = body.included.filter(inc => inc.type === 'user');
			const [user] = users.filter(u => u.id === pledge.relationships.patron.data.id);

			// we can get a lot more data for some reason, like full names, emails, etc...
			// - but there's no point, aside from wanting to harvest all that sweet data. /s

			return {
				id: user.id,
				vanity: user.attributes.vanity,
				amount_cents: pledge.attributes.amount_cents,
				created_at: pledge.attributes.created_at,
				declined_since: pledge.attributes.declined_since,
				patron_pays_fees: pledge.attributes.patron_pays_fees,
				pledge_cap_cents: pledge.attributes.pledge_cap_cents,
				image_url: user.attributes.image_url,
				discord_id: user.attributes.social_connections.discord && user.attributes.social_connections.discord.user_id,
			};
		});

	if (body.links.next) {
		patrons = [...patrons, ...await module.exports(body.links.next, token, campaign)];
	}

	if (!page) {
		await cache.set('lastFetch', patrons);
	}

	return patrons;
};
