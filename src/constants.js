module.exports.emojiNumbers = [
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
];

module.exports.colors = [{
	name: 'RED',
	color: '#F44336',
	light: false,
}, {
	name: 'PINK',
	color: '#E91E63',
	light: false,
}, {
	name: 'PURPLE',
	color: '#9C27B0',
	light: false,
}, {
	name: 'DEEP PURPLE',
	color: '#673AB7',
	light: false,
}, {
	name: 'INDIGO',
	color: '#3F51B5',
	light: false,
}, {
	name: 'BLUE',
	color: '#2196F3',
	light: false,
}, {
	name: 'LIGHT BLUE',
	color: '#03A9F4',
	light: false,
}, {
	name: 'CYAN',
	color: '#00BCD4',
	light: false,
}, {
	name: 'TEAL',
	color: '#009688',
	light: false,
}, {
	name: 'GREEN',
	color: '#4CAF50',
	light: false,
}, {
	name: 'LIGHT GREEN',
	color: '#8BC34A',
	light: false,
}, {
	name: 'LIME',
	color: '#CDDC39',
	light: true,
}, {
	name: 'YELLOW',
	color: '#FFEB3B',
	light: true,
}, {
	name: 'AMBER',
	color: '#FFC107',
	light: true,
}, {
	name: 'ORANGE',
	color: '#FF9800',
	light: true,
}, {
	name: 'DEEP ORANGE',
	color: '#FF5722',
	light: false,
}, {
	name: 'BROWN',
	color: '#795548',
	light: false,
}, {
	name: 'GREY',
	color: '#9E9E9E',
	light: false,
}, {
	name: 'BLUE GREY',
	color: '#607D8B',
	light: false,
}, {
	name: 'ROLE DEFAULT',
	color: '#4f545c',
	light: false,
}];

module.exports.colors.get = (color) => {
	const result = module.exports.colors.find(c => c.name.toLowerCase() === color.toLowerCase());
	if (result) {
		return {
			...result,
			decimal: parseInt(result.color.replace(/#/g, ''), 16),
		};
	}
};

// these are language keys that match "general.filters.actions.<human>"
module.exports.actionTypes = [{
	human: 'Disabled',
	type: 0,
}, {
	human: 'dtm',
	type: 1,
}, {
	human: 'wtu',
	type: 3,
}, {
	human: 'dtm_wtu',
	type: 2,
}, {
	human: 'ca',
	type: 4,
}];
