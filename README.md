TypeScript Require Extension
============================

This is a Node.JS `require` extension that enables requiring typescript modules without any preprocessing.

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
        targetES5: true
    });

### nodeLib [boolean] default: false
If **true** `node.d.ts` definitions file is loaded before custom ts files. This is disabled by default and you should use

    ///<reference path='node.d.ts'/>

at the beginning of your ts modules.

### targetES5 [boolean] default: true
Target ES5 / ES3 output mode.

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
`import ... module` syntax makes it possible to use TyepScript compile time validation features (like type checking).

Developed By
============

Ekin Koc - <ekin@eknkc.com>

License
=======

    Copyright 2012 Ekin Koc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
