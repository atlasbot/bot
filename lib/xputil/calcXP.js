const randomInt = require('../utils/randomInt');

// in the future, this should be changed to check for message quality and reward for higher quality messages
// for now i just want it transferred from v7 with some slight nerfs to early game
module.exports = () => randomInt(3.5, 12.5);
