const validUrl = require('valid-url');

module.exports = str => validUrl.isUri(str);
