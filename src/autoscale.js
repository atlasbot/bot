// at the itme of writing this i just want to play with kubernete :D
// idea from https://github.com/TheSharks/WildBeast/blob/df03e9402d7690cacc9735def80eff2de5263b77/src/internal/k8s-autoscale.js

module.exports = () => {
	if (process.env.AUTOSCALE !== 'true') {
		return {
			total: Number(process.env.SHARDS_TOTAL) || 1,
			mine: Number(process.env.SHARDS_MINE) || 1,
		};
	}
};
