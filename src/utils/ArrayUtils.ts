export class ArrayUtils {
    private constructor() {
    }

    static isNullOrEmpty<T>(a: (T[] | undefined)): a is undefined {
        return !(a instanceof Array) || a.length === 0;
    }

    static getUniqueItems<T>(a: T[]) {
        return a.filter((item, index) => a.indexOf(item) === index);
    }

    static removeFirst<T>(a: T[], item: T) {
        const index = a.indexOf(item);
        if (index === -1)
            return false;
        a.splice(index, 1);
        return true;
    }
}
