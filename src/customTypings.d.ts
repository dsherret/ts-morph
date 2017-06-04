/// <reference path="../node_modules/ts-nameof/ts-nameof.d.ts" />

type Constructor<T> = new(...args: any[]) => T;

type Mutable<T extends { [x: string]: any }, K extends string> = {
    [P in K]: T[P];
};
type MakeRequired<T> = Mutable<T, keyof T>;
