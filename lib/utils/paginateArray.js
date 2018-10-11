/**
 * Paginates an array.
 * @param {Array} items The array to paginate
 * @param {number} page The page you want, starting at 1.
 * @param {number} perPage The amount of values per page
 * @returns {Object} idk just look for yourself tbh i have a headache
 */
module.exports = (items, page = 1, perPage = 5) => {
	const offset = (page - 1) * perPage;

	const paginatedItems = items
		.filter(m => m)
		.map((m, i) => {
			m.index = i;

			return m;
		})
		.slice(offset)
		.slice(0, perPage);

	const totalPages = Math.ceil(items.length / perPage);

	return {
		page,
		perPage,
		prePage: page - 1 ? page - 1 : null,
		nextPage: totalPages > page ? page + 1 : null,
		total: items.length,
		totalPages,
		data: paginatedItems,
	};
};
