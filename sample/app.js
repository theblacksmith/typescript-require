// Initialize
// Should be require('typescript-require'); in your modules.
require('../');

// Get functions.ts
var funcs = require("./funcs.ts");
console.log(funcs.lowercase("HELLO!"));
