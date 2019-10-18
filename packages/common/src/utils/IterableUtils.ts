export class IterableUtils {
    static find<T>(items: IterableIterator<T>, condition: (item: T) => boolean): T | undefined {
        for (const item of items) {
            if (condition(item))
                return item;
        }
        return undefined;
    }
}
