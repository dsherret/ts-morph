/// <reference path="../node_modules/ts-nameof/ts-nameof.d.ts" />

/** Constructor type */
type Constructor<T> = new(...args: any[]) => T;
