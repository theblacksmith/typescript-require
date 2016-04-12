var vm = require('vm');
var fs = require('fs');
var path = require('path');

var tsc = path.join(path.dirname(require.resolve("typescript")),"tsc.js");
var tscScript = new vm.Script(fs.readFileSync(tsc, "utf8"), {
  filename: tsc
});

var disallowedOptions = ['outDir', 'outFile', 'rootDir'];

var options = {
  exitOnError: true,
  tmpDir: 'tmp/tsreq',
  extraFiles: [],
  tscOptions: {
    target: "ES5",
    module: "commonjs",
    inlineSourceMap: null
  }
};

module.exports = function(opts) {
  options = merge(options, opts);
};

require.extensions['.ts'] = function(module) {
  var jsname = compileTS(module);
  runJS(jsname, module);
};

function isModified(tsname, jsname) {
  var tsMTime = fs.statSync(tsname).mtime;

  try {
    var jsMTime = fs.statSync(jsname).mtime;
  } catch (e) { //catch if file does not exists
    jsMTime = 0;
  }

  return tsMTime > jsMTime;
}

/**
 * Compiles TypeScript file, returns js file path
 * @return {string} js file path
 */
function compileTS (module) {
  var exitCode = 0;
  var tmpDir = path.join(process.cwd(), options.tmpDir);
  var relativeFolder = path.dirname(path.relative(process.cwd(), module.filename));
  var jsname = path.join(tmpDir, relativeFolder, path.basename(module.filename, ".ts") + ".js");
  
  if (!isModified(module.filename, jsname)) {
    return jsname;
  }

  var argv = [
    "node",
    "tsc.js",
    "--outDir",
    path.join(tmpDir, relativeFolder)
  ];
  Object.keys(options.tscOptions).forEach(function(k) {
    if (options.tscOptions[k] === false || disallowedOptions.indexOf(k) > -1) {
      // Ignore disallowed options; also, tsc doesn't ever require a "false" option, it just
      // defaults to no for those unless specified otherwise, so ignore those too.
      // When it's just a "true" then we don't need a value.
      return;
    }
    argv.push("--" + k);
    if (options.tscOptions[k] && options.tscOptions[k] !== true) {
      argv.push(options.tscOptions[k]);
    }
  });
  argv = argv.concat(options.extraFiles);
  argv.push(module.filename);

  // console.log(argv);

  var proc = merge(merge({}, process), {
    argv: compact(argv),
    exit: function(code) {
      if (code !== 0 && options.exitOnError) {
        console.error('Fatal Error. Unable to compile TypeScript file. Exiting.');
        process.exit(code);
      }
      exitCode = code;
    }
  });

  var sandbox = {
    process: proc,
    require: require,
    module: module,
    Buffer: Buffer,
    setTimeout: setTimeout,
    __filename: tsc,
    __dirname: path.dirname(tsc)
  };

  tscScript.runInNewContext(sandbox, {
    filename: tsc
  });
  if (exitCode != 0) {
    throw new Error('Unable to compile TypeScript file.');
  }

  return jsname;
}

function runJS (jsname, module) {
  var content = fs.readFileSync(jsname, 'utf8');

  var sandbox = {};
  for (var k in global) {
    sandbox[k] = global[k];
  }
  sandbox.require = module.require.bind(module);
  sandbox.exports = module.exports;
  sandbox.__filename = jsname;
  sandbox.__dirname = path.dirname(module.filename);
  sandbox.module = module;
  sandbox.global = sandbox;
  sandbox.root = root;

  return vm.runInNewContext(content, sandbox, { filename: jsname });
}

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

function compact(arr) {
  var narr = [];
  arr.forEach(function(data) {
    if (data) narr.push(data);
  });
  return narr;
}
