/* eslint max-len:0 */

/**
* Flattens a nested array into a single level array
* @private
* @param  {Array} input The top level array to flatten
* @param  {boolean} [includingObjects=false] If an object is encountered and this argument is truthy, the object will also be flattened by its property values.
* @return {Array}
*/
module.exports = exports = function flatten (input, includingObjects) {
	var result = [];

	function descend (level) {
		if (Array.isArray(level)) {
			level.forEach(descend);
		} else if (typeof level === 'object' && includingObjects) {
			Object.keys(level).forEach((key) => {
				descend(level[key]);
			});
		} else {
			result.push(level);
		}
	}

	descend(input);

	return result;
};
