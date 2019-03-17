type Mutable<T extends { [x: string]: any }, K extends string> = {
    [P in K]: T[P];
};
type GetStrings<T> = T extends string ? T : never;
type MakeRequired<T> = Mutable<T, GetStrings<keyof T>>;
// From: https://stackoverflow.com/a/48216010/188246
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type InferArrayElementType<T> = T extends (infer U)[] ? U : T extends ReadonlyArray<infer U> ? U : never;
