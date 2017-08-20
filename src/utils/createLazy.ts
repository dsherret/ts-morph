// todo: tests
export function createLazy<T>(func: () => T) {
    let hasRun = false;
    let val: T;

    return () => {
        if (hasRun)
            return val;

        val = func();
        hasRun = true;
        return val;
    };
}
