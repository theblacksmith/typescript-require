var fs = require('fs');
var path = require('path');

var io = require("./io");

var fileName = null;

// Make up a temp file
['TMPDIR', 'TMP', 'TEMP'].forEach(function(td) {
    if (!fileName && process.env[td])
        fileName = process.env[td];
});

fileName = path.join((fileName || "/tmp"), "typescript-require-" + Date.now() + ".js");

var contents = [
    "(function() {",
    fs.readFileSync(path.join(__dirname, "/node_modules/typescript/bin/typescript.js"), "utf8"),
    "module.exports = TypeScript;",
    "}).call({});"
].join("");
fs.writeFileSync(fileName, contents, "utf8");

var TypeScript = require(fileName);
TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;

fs.unlinkSync(fileName);

require.extensions['.ts'] = function(module) {
    var js = '';

    var output = {
        Write: function(value) { js += value; },
        WriteLine: function(value) { js += value + "\n"; },
        Close: function() {}
    };

    var nulloutput = {
        Write: function(value) {},
        WriteLine: function(value) {},
        Close: function() {}
    };

    var settings = new TypeScript.CompilationSettings();
    settings.codeGenTarget = TypeScript.CodeGenTarget.ES5;
    settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
    settings.resolve = true;

    var env = new TypeScript.CompilationEnvironment(settings, io);

    var resolver = new TypeScript.CodeResolver(env);
    var fpath = TypeScript.switchToForwardSlashes(module.filename);

    var units = [path.join(__dirname, "./typings/lib.d.ts"), path.join(__dirname, "./typings/node.d.ts")];

    resolver.resolveCode(fpath, "", false, {
        postResolution: function(p, code) {
            if (units.indexOf(p) < 0)
                units.push(p);
        },
        postResolutionError: function(file, message) {
            throw new Error('TypeScript Error: ' + message + '\n File: ' + file);
        }
    });

    var compiler = new TypeScript.TypeScriptCompiler(output, output, new TypeScript.NullLogger(), settings);

    compiler.parser.errorRecovery = true;

    compiler.setErrorCallback(function(start, len, message, block) {
        var error = new Error('TypeScript Error: ' + message + '\n File: ' + units[block] + ' Start position: ' + start + ' Length: ' + len);
        error.stack = '';
        throw error;
    });

    units.forEach(function(u) {
        compiler.addUnit(fs.readFileSync(u, "utf8"), u, false);
    });

    compiler.typeCheck();

    compiler.emit(true, function(fn) {
        if (fn == fpath.replace(/\.ts$/, ".js"))
            return output;
        else
            return nulloutput;
    });

    module._compile(js, fpath);
};
