/// <reference path="./interface.d.ts" />

import storage = require('./export');

export class Something implements bugfix {
	public getImport(): string {
		return storage.fruit;
	}
}
