/// <reference path="../node_modules/ts-nameof/ts-nameof.d.ts" />

type Mutable<T extends { [x: string]: any }, K extends string> = {
    [P in K]: T[P];
};
type MakeRequired<T> = Mutable<T, keyof T>;
