export class ObjectUtils {
    private constructor() {
    }

    static assign<T, U>(a: T, b: U): T & U {
        if (Object.assign != null)
            return Object.assign<T, U>(a, b);
        return this.es5Assign(a, b);
    }

    static es5Assign<T, U>(a: T, b: U): T & U {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
        const to = Object(a);

        for (let index = 1; index < arguments.length; index++) {
            const nextSource = arguments[index];
            if (nextSource == null)
                continue;

            for (const nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey))
                    to[nextKey] = nextSource[nextKey];
            }
        }

        return to;
    }
}
