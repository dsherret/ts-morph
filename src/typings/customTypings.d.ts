type Mutable<T extends { [x: string]: any }, K extends string> = {
    [P in K]: T[P];
};
type GetStrings<T> = T extends string ? T : never;
type MakeRequired<T> = Mutable<T, GetStrings<keyof T>>;
type InferArrayElementType<T> = T extends (infer U)[] ? U : T extends ReadonlyArray<infer U> ? U : never;
type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
