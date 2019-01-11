// at the itme of writing this i just want to play with kubernete :D
// from https://github.com/TheSharks/WildBeast/blob/df03e9402d7690cacc9735def80eff2de5263b77/src/internal/k8s-autoscale.js
const os = require('os');
const superagent = require('superagent');

const prettyMs = require('atlas-lib/lib/utils/prettyMs');

module.exports = async () => {
	if (process.env.AUTOSCALE !== 'true') {
		return {
			total: Number(process.env.SHARDS_TOTAL) || 1,
			mine: Number(process.env.SHARDS_MINE) || 0,
		};
	}

	// FIXME: this could be inaccurate if the values change while we're starting
	const { body: { shards, session_start_limit: startLimit } } = await superagent.get('https://discordapp.com/api/gateway/bot')
		.set('Authorization', `Bot ${process.env.TOKEN}`);

	if (startLimit.remaining < 1) {
		console.error(`Reached start limit, resets in ${prettyMs(startLimit.reset_after)}`);
	}

	// each pod's hostname matches a known pattern like web-0 or web-1
	// https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id
	const match = os.hostname().match(/[\w]+-([\d]+)/);

	if (!match) {
		console.error(new Error('Could not pull ordinal index from hostname.'));

		process.exit(1);
	}

	const index = Number(match[1]);

	return {
		total: shards,
		mine: index,
	};
};
