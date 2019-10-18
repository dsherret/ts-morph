import { Comparer, StoredComparer } from "../comparers";
import { ts } from "../typescript";

export class ArrayUtils {
    private constructor() {
    }

    static isReadonlyArray<T>(a: unknown): a is ReadonlyArray<T> {
        return a instanceof Array;
    }

    static isNullOrEmpty<T>(a: (ReadonlyArray<T> | undefined)): a is undefined {
        return !(a instanceof Array) || a.length === 0;
    }

    static getUniqueItems<T>(a: ReadonlyArray<T>) {
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

    // can't use ReadonlyArray here for some reason
    static flatten<T>(items: T[][]): T[] {
        return items.reduce((a, b) => a.concat(b), []);
    }

    static from<T>(items: ts.Iterator<T>) {
        const a: T[] = [];
        for (const item of items as any) // it will work
            a.push(item);
        return a;
    }

    static *toIterator<T>(items: ReadonlyArray<T>) {
        for (const item of items)
            yield item;
    }

    static sortByProperty<T>(items: T[], getProp: (item: T) => string | number) {
        items.sort((a, b) => getProp(a) <= getProp(b) ? -1 : 1);
        return items;
    }

    static groupBy<T>(items: ReadonlyArray<T>, getGroup: (item: T) => string | number) {
        const result: T[][] = [];
        const groups: { [key: string]: T[]; } = {};

        for (const item of items) {
            const group = getGroup(item).toString();
            if (groups[group] == null) {
                groups[group] = [];
                result.push(groups[group]);
            }
            groups[group].push(item);
        }

        return result;
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

    static binarySearch<T>(items: ReadonlyArray<T>, storedComparer: StoredComparer<T>) {
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

    static containsSubArray<T>(items: ReadonlyArray<T>, subArray: ReadonlyArray<T>) {
        let findIndex = 0;
        for (const item of items) {
            if (subArray[findIndex] === item) {
                findIndex++;
                if (findIndex === subArray.length)
                    return true;
            }
            else {
                findIndex = 0;
            }
        }

        return false;
    }
}
