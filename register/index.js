const tsr = require("./lib");

module.exports = function (opts) {
  tsr.configure(opts);
}

tsr.register();
