/// <reference path="../../references/interface.d.ts" />

import storage = require('../../references/export');

export class Something implements bugfix {
	public getImport(): string {
		return storage.fruit;
	}
}
