/**
 * Formats a date to a human readable time.
 * @param {Date} date The date to format
 * @param {boolean} exact Whether to include minutes/seconds
 * @param {boolean} timezone Whether to include the timezone that the date is in
 * @returns {string}
 */
module.exports = (date, exact, timezone) => (new Intl.DateTimeFormat('en', {
	month: 'short',
	year: 'numeric',
	day: 'numeric',
	hour: exact ? 'numeric' : undefined,
	minute: exact ? 'numeric' : undefined,
	timeZoneName: timezone ? 'short' : undefined,
	hour12: true,
	timeZone: 'UTC',
})).format(date);
