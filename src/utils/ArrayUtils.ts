import { ts } from "../typescript";
import { Comparer, StoredComparer } from "./comparers";

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

    static removeAll<T>(a: T[], isMatch: (item: T) => boolean) {
        const removedItems: T[] = [];
        for (let i = a.length - 1; i >= 0; i--) {
            if (isMatch(a[i])) {
                removedItems.push(a[i]);
                a.splice(i, 1);
            }
        }
        return removedItems;
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

    static findIndex<T>(items: T[], condition: (item: T) => boolean) {
        for (let i = 0; i < items.length; i++) {
            if (condition(items[i]))
                return i;
        }
        return -1;
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
        items.sort((a, b) => getProp(a) <= getProp(b) ? -1 : 1);
        return items;
    }

    static binaryInsertWithOverwrite<T>(items: T[], newItem: T, comparer: Comparer<T>) {
        let top = items.length - 1;
        let bottom = 0;

        while (bottom <= top) {
            const mid = Math.floor((top + bottom) / 2);
            if (comparer.compareTo(newItem, items[mid]) < 0)
                top = mid - 1;
            else
                bottom = mid + 1;
        }

        // overwrite an existing item
        if (items[top] != null && comparer.compareTo(newItem, items[top]) === 0)
            items[top] = newItem;
        else
            items.splice(top + 1, 0, newItem);
    }

    static binarySearch<T>(items: T[], storedComparer: StoredComparer<T>) {
        let top = items.length - 1;
        let bottom = 0;

        while (bottom <= top) {
            const mid = Math.floor((top + bottom) / 2);
            const comparisonResult = storedComparer.compareTo(items[mid]);
            if (comparisonResult === 0)
                return mid;
            else if (comparisonResult < 0)
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
