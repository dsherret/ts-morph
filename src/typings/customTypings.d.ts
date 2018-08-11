type Mutable<T extends { [x: string]: any }, K extends string> = {
    [P in K]: T[P];
};
type GetStrings<T> = T extends string ? T : never;
type MakeRequired<T> = Mutable<T, GetStrings<keyof T>>;
