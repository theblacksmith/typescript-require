///<reference path='../typings/node.d.ts'/>
import tsmodule = module("tsmodule");
var jsmodule = require("./jsmodule.js");

export function lowercase(val:string) {
    return val.toLowerCase();
}

export function uppercase(val:string) {
    return val.toUpperCase();
}

if (tsmodule.test() == jsmodule.test()) {
    console.log("MODULE LOADING OK!")
}
