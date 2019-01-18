// for the most part i'm playing with kubernetes for fun, i understand it's overkill
// from https://github.com/TheSharks/WildBeast/blob/df03e9402d7690cacc9735def80eff2de5263b77/src/internal/k8s-autoscale.js
const os = require('os');

// we don't need statefulsets for kubernetes, but after a significant amount of googling they appear to be the only
// way to get the ordinal index of each pod (shard), so there isn't really any other way bar something that requires a lot more effort
module.exports = async () => {
	if (process.env.AUTOSCALE !== 'true') {
		return {
			total: Number(process.env.SHARDS_TOTAL) || 1,
			mine: Number(process.env.SHARDS_MINE) || 0,
		};
	}

	// each pod's hostname matches a known pattern like bot-0 or bot-1 thanks to statefulsets
	// https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id
	const match = os.hostname().match(/[\w]+-([\d]+)/);

	if (!match) {
		console.error(new Error('Could not pull ordinal index from hostname.'));

		process.exit(1);
	}

	const index = Number(match[1]);

	return {
		total: Number(process.env.SHARDS_TOTAL),
		mine: index,
	};
};
