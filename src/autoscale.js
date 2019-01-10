// at the itme of writing this i just want to play with kubernete :D
// from https://github.com/TheSharks/WildBeast/blob/df03e9402d7690cacc9735def80eff2de5263b77/src/internal/k8s-autoscale.js
const os = require('os');

module.exports = async () => {
	if (process.env.AUTOSCALE !== 'true') {
		return {
			total: Number(process.env.SHARDS_TOTAL) || 1,
			mine: Number(process.env.SHARDS_MINE) || 0,
		};
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
		total: Number(process.env.SHARDS_TOTAL),
		mine: index,
	};
};
