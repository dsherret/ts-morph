export function setValueIfUndefined<T, U extends keyof T>(obj: T, propertyName: U, defaultValue: T[U]) {
    if (typeof obj[propertyName] === "undefined")
        obj[propertyName] = defaultValue;
}
