// TODO: this should probably be moved to constants

module.exports = [{
	name: 'RED',
	color: '#F44336',
	light: false,
	palette_id: 'muic_red',
}, {
	name: 'PINK',
	color: '#E91E63',
	light: false,
	palette_id: 'muic_pink',
}, {
	name: 'PURPLE',
	color: '#9C27B0',
	light: false,
	palette_id: 'muic_purple',
}, {
	name: 'DEEP PURPLE',
	color: '#673AB7',
	light: false,
	palette_id: 'muic_deep_purple',
}, {
	name: 'INDIGO',
	color: '#3F51B5',
	light: false,
	palette_id: 'muic_indigo',
}, {
	name: 'BLUE',
	color: '#2196F3',
	light: false,
	palette_id: 'muic_blue',
}, {
	name: 'LIGHT BLUE',
	color: '#03A9F4',
	light: false,
	palette_id: 'muic_light_blue',
}, {
	name: 'CYAN',
	color: '#00BCD4',
	light: false,
	palette_id: 'muic_cyan',
}, {
	name: 'TEAL',
	color: '#009688',
	light: false,
	palette_id: 'muic_teal',
}, {
	name: 'GREEN',
	color: '#4CAF50',
	light: false,
	palette_id: 'muic_green',
}, {
	name: 'LIGHT GREEN',
	color: '#8BC34A',
	light: false,
	palette_id: 'muic_light_green',
}, {
	name: 'LIME',
	color: '#CDDC39',
	light: true,
	palette_id: 'muic_lime',
}, {
	name: 'YELLOW',
	color: '#FFEB3B',
	light: true,
	palette_id: 'muic_yellow',
}, {
	name: 'AMBER',
	color: '#FFC107',
	light: true,
	palette_id: 'muic_amber',
}, {
	name: 'ORANGE',
	color: '#FF9800',
	light: true,
	palette_id: 'muic_orange',
}, {
	name: 'DEEP ORANGE',
	color: '#FF5722',
	light: false,
	palette_id: 'muic_deep_orange',
}, {
	name: 'BROWN',
	color: '#795548',
	light: false,
	palette_id: 'muic_brown',
}, {
	name: 'GREY',
	color: '#9E9E9E',
	light: false,
	palette_id: 'muic_grey',
}, {
	name: 'BLUE GREY',
	color: '#607D8B',
	light: false,
	palette_id: 'muic_blue_grey',
}];

module.exports.get = (color) => {
	const result = module.exports.find(c => c.name.toLowerCase() === color);
	if (result) {
		return {
			...result,
			decimal: parseInt(result.color.replace(/#/g, ''), 16),
		};
	}
};
