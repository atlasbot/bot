module.exports = (date, exact) => (new Intl.DateTimeFormat('en', {
	month: 'short',
	year: 'numeric',
	day: 'numeric',
	hour: exact ? 'numeric' : undefined,
	minute: exact ? 'numeric' : undefined,
	hour12: true,
	timeZone: 'UTC',
})).format(date);
