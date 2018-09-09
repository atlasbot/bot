const validUrl = require('valid-url');

// this was previously using a custom function which is why this is weird
// in the future this might be changed again so keeping it like this is good (i think)
module.exports = validUrl.isUri;
