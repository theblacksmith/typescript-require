TypeScript Require Extension
============================

This is a Node.JS `require` extension that enables requiring typescript modules without any preprocessing.

[![Build Status](https://travis-ci.org/theblacksmith/typescript-require.svg)](https://travis-ci.org/theblacksmith/typescript-require)

# Install
Install via npm:

    npm install typescript-require

# Use

During the boot up process of your application, require `typescript-require` once;

    require('typescript-require');

After this point, you can require any .ts module just like .js modules. `typescript-require` will find out
and compile the TypeScript file, resolving any necessary dependencies to other scripts.

# Sample

#### app.js
    // Initialize
    require('typescript-require');

    // Get functions.ts
    var funcs = require("./funcs.ts");
    console.log(funcs.lowercase("HELLO!"));

#### funcs.ts
    export function lowercase(val:string) {
        return val.toLowerCase();
    }

    export function uppercase(val:string) {
        return val.toUpperCase();
    }

# Configuration
It is possible to configure the require extension upon initialization:

    // Initialize
    require('typescript-require')({
        nodeLib: false,
        targetES5: true,
        exitOnError: true,
        emitOnError: true
    });

### nodeLib [boolean] default: false
If **true** `node.d.ts` definitions file is loaded before custom ts files. This is disabled by default and you should use

    ///<reference path='node.d.ts'/>

at the beginning of your ts modules.

### targetES5 [boolean] default: true
Target ES5 / ES3 output mode.

### exitOnError [boolean] default: true
Calls `process.exit` if an error occurs during TypeScript compilation

### tmpDir [string] default: ./tmp
The directory underneath which output files should be placed

### emitOnError [boolean] default: false
Tells the TypeScript compiler whether or not to emit JS files if an error occurs.

# Module Dependencies in TS files
You can load any other TypeScript or Javascript module from your typescripts. However, you should
use different methods for different modules

### sample.ts
Given that there are two files, `foomodule.js` and `barmodule.ts` at the same directory as sample.ts

    ///<reference path='node.d.ts'/>

    // Load a JavaScript module with standard Node.JS require
    var foomodule = require('./foomodule.js');

    // Load a TypeScript module with TypeScript module syntax
    import barmodule = module('barmodule');
    ```
Note that the second one essentially gets compiled to a `require` call just like the first one. However,
`import ... module` syntax makes it possible to use TypeScript compile time validation features (like type checking).

Developed By
============

Ekin Koc - <ekin@eknkc.com>

License
=======

    The MIT License (MIT)

    Copyright (c) 2012 Ekin Koc

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
