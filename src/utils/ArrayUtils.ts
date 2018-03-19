import {ts} from "../typescript";

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

    static flatten<T>(items: T[][]) {
        return items.reduce((a, b) => a.concat(b), []);
    }

    static find<T extends ts.Node>(items: ts.NodeArray<T>, condition: (item: T) => boolean): T | undefined;
    static find<T>(items: T[] | IterableIterator<T>, condition: (item: T) => boolean): T | undefined;
    static find<T>(items: T[] | IterableIterator<T> | ts.NodeArray<any>, condition: (item: T) => boolean) {
        for (const item of items) {
            if (condition(item))
                return item;
        }
        return undefined;
    }

    static from<T>(items: Iterable<T> | ts.Iterator<T>) {
        const a: T[] = [];
        for (const item of items)
            a.push(item);
        return a;
    }

    static *toIterator<T>(items: T[]) {
        for (const item of items) {
            yield item;
        }
    }

    static sortByProperty<T>(items: T[], getProp: (item: T) => string | number) {
        items.sort((a, b) => getProp(a) < getProp(b) ? -1 : 1);
        return items;
    }

    static binaryInsert<T>(items: T[], newItem: T, isGreaterThan: (item: T) => boolean) {
        let top = items.length - 1;
        let bottom = 0;

        while (bottom <= top) {
            const mid = Math.floor((top + bottom) / 2);
            if (isGreaterThan(items[mid]))
                top = mid - 1;
            else
                bottom = mid + 1;
        }

        items.splice(top + 1, 0, newItem);
    }

    static binarySearch<T>(items: T[], isEqual: (item: T) => boolean, isGreaterThan: (item: T) => boolean) {
        let top = items.length - 1;
        let bottom = 0;

        while (bottom <= top) {
            const mid = Math.floor((top + bottom) / 2);
            if (isEqual(items[mid]))
                return mid;

            if (isGreaterThan(items[mid]))
                top = mid - 1;
            else
                bottom = mid + 1;
        }

        return -1;
    }

    static containsSubArray<T>(items: T[], subArray: T[]) {
        let findIndex = 0;
        for (const item of items) {
            if (subArray[findIndex] === item) {
                findIndex++;
                if (findIndex === subArray.length)
                    return true;
            }
            else
                findIndex = 0;
        }

        return false;
    }
}
