// originally from stackoverflow somewhere

module.exports.wildcardToRegExp = s => new RegExp(`^${s.split(/\*+/).map(module.exports.regExpEscape).join('.*')}$`);
module.exports.regExpEscape = s => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
