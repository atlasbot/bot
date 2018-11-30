/*
	Ported directly from v7 for compatibility, will be replaced when i have time (hopefully).
*/

/*
	So originally I wanted to be able to have full compatibility between mee6's levels and atlas', so in the future
	you could import mee6 > atlas, but in the end i decided it was a bit of a dick move. but because of wanting that compatibility,
	this is more or less just a worse version of mee6's levels.

	In the future, I want to come back and change this, but for now to save me the headache of having to move to the new level system for antares
	i had in mind and calculate differences between versions and shit, i'm just gonna leave it as is. ¯\_(ツ)_/¯

	source: https://github.com/cookkkie/mee6/blob/4a7ba6b900277dd4e55c1e2a119d49ae9f98814b/chat-bot/plugins/levels.py#L22

	i could have probably summed that up in half a sentence lol
*/

/**
 * Gets the XP required for a level.
 * @param {number} n The level
 * @returns {number} The XP required for that level
 */
module.exports = n => ((5 * (n ** 2)) + 50) * n;
