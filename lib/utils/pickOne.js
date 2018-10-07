const randomInt = require('./randomInt');

module.exports = arr => arr[randomInt(arr.length)];
