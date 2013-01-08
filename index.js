var fs = require('fs');
var path = require('path');

var io = require("./io");

var tsTempFile = null;
['TMPDIR', 'TMP', 'TEMP'].forEach(function(td) {
    if(!tsTempFile && process.env[td]) tsTempFile = process.env[td];
});
tsTempFile = path.join((tsTempFile || "/tmp"), "typescript-require-" + Date.now() + ".js");

var contents = ["(function() {", fs.readFileSync(require.resolve("typescript"), "utf8"), "module.exports = TypeScript;", "}).call({});"].join("");

fs.writeFileSync(tsTempFile, contents, "utf8");

var TypeScript = module.exports.TypeScript = require(tsTempFile);
TypeScript.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;

fs.unlinkSync(tsTempFile);


//setting up the compiler
var settings = new TypeScript.CompilationSettings();
settings.codeGenTarget = TypeScript.CodeGenTarget.ES5;
settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
settings.resolve = true;

var env = new TypeScript.CompilationEnvironment(settings, io);

require.extensions['.ts'] = function(module) {
    
    var js = '';
    var output = {
        Write: function(value) {
            js += value;
        },
        WriteLine: function(value) {
            js += value + "\n";
        },
        Close: function() {}
    };

    var nulloutput = {
        Write: function(value) {},
        WriteLine: function(value) {},
        Close: function() {}
    };
    var compiler = new TypeScript.TypeScriptCompiler(null, new TypeScript.NullLogger(), settings);
    compiler.parser.errorRecovery = true;
    var units = [{
        fileName: path.join(__dirname, "./typings/lib.d.ts")
    }];

    var moduleFilename = TypeScript.switchToForwardSlashes(module.filename);

    var resolver = new TypeScript.CodeResolver(env);

    resolver.resolveCode(moduleFilename, "", false, {
        postResolution: function(file, code) {
            if(!units.some(function(u) {
                return u.fileName == code.path
            })) units.push({
                fileName: code.path,
                code: code.content
            });
        },
        postResolutionError: function(file, message) {
            throw new Error('TypeScript Error: ' + message + '\n File: ' + file);
        }
    });
    
    var isErrorPrinted = false;

    compiler.setErrorCallback(function(start, len, message, block) {

        if(isErrorPrinted == false && units[block].fileName == moduleFilename) {
            var code = units[block].code;
            var cursor = code.substr(0, start).split('\n');
            var line = [
            cursor.slice(-1)[0].replace(/^\s+/, ""), code.substr(start, len), code.substr(start + len).split('\n').slice(0, 1)[0].replace(/\s+$/, "")];

            var underline = [
            line[0].replace(/./g, '-'), line[1].replace(/./g, '^'), line[2].replace(/./g, '-'), ];

            var error = new Error('TypeScript Error: ' + message);
            error.stack = ['TypeScript Error: ' + message, 'File: ' + units[block].fileName, '', 'Line '+cursor.length +': '+ line.join(""), '------' + underline.join("")].join('\n');

            console.error('\n' + error.stack);

            isErrorPrinted = true;
        }
    });

    units.forEach(function(u) {
        if(!u.code) u.code = fs.readFileSync(u.fileName, "utf8");

        compiler.addUnit(u.code, u.fileName, false);
    });

    compiler.typeCheck();

    compiler.emit(function(fn) {
        count = 0;
        if(fn == moduleFilename.replace(/\.ts$/, ".js")) return output;
        else return nulloutput;
    });

    module._compile(js, moduleFilename);
};