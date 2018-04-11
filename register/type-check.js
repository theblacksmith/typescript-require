const tsr = require("./lib");
const util = require("./lib/util");

module.exports = function (opts) {
  tsr.configure(util.merge(opts, { typeCheck: true }));
}

tsr.register({
  typeCheck: true
})
