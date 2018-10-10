module.exports = {
	get inviteRegex() {
		return /discord(?:app\.com\/invite|\.gg)\/([\w-]{2,255})/i;
	},
	emojiNumbers: [
		'zero',
		'one',
		'two',
		'three',
		'four',
		'five',
		'six',
		'seven',
		'eight',
		'nine',
	],
	colors: [{
		name: 'RED',
		hex: '#F44336',
		light: false,
	}, {
		name: 'PINK',
		hex: '#E91E63',
		light: false,
	}, {
		name: 'PURPLE',
		hex: '#9C27B0',
		light: false,
	}, {
		name: 'DEEP PURPLE',
		hex: '#673AB7',
		light: false,
	}, {
		name: 'INDIGO',
		hex: '#3F51B5',
		light: false,
	}, {
		name: 'BLUE',
		hex: '#2196F3',
		light: false,
	}, {
		name: 'LIGHT BLUE',
		hex: '#03A9F4',
		light: false,
	}, {
		name: 'CYAN',
		hex: '#00BCD4',
		light: false,
	}, {
		name: 'TEAL',
		hex: '#009688',
		light: false,
	}, {
		name: 'GREEN',
		hex: '#4CAF50',
		light: false,
	}, {
		name: 'LIGHT GREEN',
		hex: '#8BC34A',
		light: false,
	}, {
		name: 'LIME',
		hex: '#CDDC39',
		light: true,
	}, {
		name: 'YELLOW',
		hex: '#FFEB3B',
		light: true,
	}, {
		name: 'AMBER',
		hex: '#FFC107',
		light: true,
	}, {
		name: 'ORANGE',
		hex: '#FF9800',
		light: true,
	}, {
		name: 'DEEP ORANGE',
		hex: '#FF5722',
		light: false,
	}, {
		name: 'BROWN',
		hex: '#795548',
		light: false,
	}, {
		name: 'GREY',
		hex: '#9E9E9E',
		light: false,
	}, {
		name: 'BLUE GREY',
		hex: '#607D8B',
		light: false,
	}, {
		name: 'ROLE DEFAULT',
		hex: '#4f545c',
		light: false,
	}],
	actionTypes: [{
		key: 'disabled',
		type: 0,
	}, {
		key: 'dtm',
		type: 1,
	}, {
		key: 'dtm_wtu',
		type: 2,
	}, {
		key: 'wtu',
		type: 3,
	}],
	verificationLevels: [
		{
			level: 0,
			text: 'None',
		},
		{
			level: 1,
			text: 'Low',
		},
		{
			level: 2,
			text: 'Medium',
		},
		{
			level: 3,
			text: '(╯°□°）╯︵ ┻━┻',
		},
		{
			level: 4,
			text: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻',
		},
	],
};

module.exports.colors.get = (color) => {
	const result = module.exports.colors.find(c => c.name.toLowerCase() === color.toLowerCase());
	if (result) {
		return {
			...result,
			decimal: parseInt(result.hex.replace(/#/g, ''), 16),
		};
	}
};
