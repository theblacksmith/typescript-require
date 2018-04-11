import { statSync } from "fs";

export function merge(a: any, b: any) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}

export function compact(arr: any[]) {
  var narr: any[] = [];

  arr.forEach(function(data) {
    if (data) { narr.push(data); }
  });

  return narr;
}

export function isModified(tsname: string, jsname: string) {
  const tsMTime: Date = statSync(tsname).mtime;
  let jsMTime: Date = new Date(1984, 1, 17);

  try {
    jsMTime = statSync(jsname).mtime;
  } catch (e) { //catch if file does not exists
  }

  return tsMTime > jsMTime;
}
