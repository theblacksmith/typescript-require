import { Script, runInNewContext } from "vm";
import { readFileSync, statSync, Stats } from "fs";
import { join, dirname, relative, basename } from "path";
import { TSROptions } from "./options";
import * as util from './util';

// This is an ugly hack, but many typescript things may need reflect-metadata;
// sad fact is that the way this library loads typescript files and the way reflect-metadata
// works are entirely incompatible. This is the simple but hacky workaround
try { require('reflect-metadata'); } catch(e) {}

const tsc = join(dirname(require.resolve("typescript")),"tsc.js");
const tscScript = new Script(readFileSync(tsc, "utf8"), {
  filename: tsc
});

const disallowedOptions = ['outDir', 'outFile', 'rootDir'];

let options: TSROptions = {
  exitOnError: true,
  tmpDir: 'tmp/tsreq',
  extraFiles: [],
  tscOptions: {
    target: "ES5",
    module: "commonjs",
    inlineSourceMap: null
  }
};

export function configure(opts: TSROptions) {
  options = util.merge(options, opts);
}

require.extensions['.ts'] = require.extensions['.tsx'] = function(module: NodeModule) {
  let jsname = compileTS(module);
  runJS(jsname, module);
};

let projectBuilt: boolean | null = null;

/**
 * if projectDir is specified return that otherwise return the current working directory.
 **/
function getTsRoot(): string {
    return (options.projectDir ? options.projectDir : process.cwd());
}

/**
 * Compiles TypeScript file, returns js file path
 * @return {string} js file path
 */
function compileTS (module: NodeModule) {
  var exitCode = 0;
  var tmpDir = join(getTsRoot(), options.tmpDir);
  var relativeFolder = dirname(relative(getTsRoot(), module.filename));
  var jsname = join(tmpDir, relativeFolder, basename(module.filename, ".ts") + ".js");

  if (!util.isModified(module.filename, jsname)) {
    return jsname;
  }

  var argv = [
    "node",
    "tsc.js",
    "--outDir",
    tmpDir,
    "--rootDir",
    process.cwd()
  ];
  if (options.projectDir && projectBuilt === null) {
    // For more complex projects it's better to set up a tsconfig.json file with the outDir set to
    // the tmpDir and let it compile them all when we first start up; in that case
    argv = [
      "node",
      "tsc.js",
      "-p",
      options.projectDir
    ];
    projectBuilt = false;
  } else {
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
  }

  if (!projectBuilt) {
    console.log(argv);
    var proc = util.merge(util.merge({}, process), {
      argv: util.compact(argv),
      exit: function(code: number) {
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
      __dirname: dirname(tsc)
    };

    tscScript.runInNewContext(sandbox, {
      filename: tsc
    });
    if (exitCode !== 0) {
      throw new Error('Unable to compile TypeScript file.');
    }
    if (projectBuilt === false) {
      // We're building the full project and only need to do it once
      projectBuilt = true;
    }
  }

  return jsname;
}

function runJS (jsname: string, module: any) {
  let content = readFileSync(jsname, 'utf8');
  let sandbox: any = {};

  for (var k in global) {
    sandbox[k] = (<any>global)[k];
  }

  sandbox.require = module.require.bind(module);
  sandbox.require.cache = require.cache;
  sandbox.require.resolve = require.resolve.bind(sandbox.require);
  sandbox.exports = module.exports;
  sandbox.__filename = jsname;
  sandbox.__dirname = dirname(module.filename);
  sandbox.module = module;
  sandbox.global = sandbox;
  sandbox._global = global;
  sandbox.Reflect = (<any>global).Reflect;

  return runInNewContext(content, sandbox, { filename: jsname });
}
