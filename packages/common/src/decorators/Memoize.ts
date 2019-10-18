/** Decorator for memoizing the result of a method or get accessor. */
export function Memoize(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
    if (descriptor.value != null)
        descriptor.value = getNewFunction(descriptor.value);
    else if (descriptor.get != null)
        descriptor.get = getNewFunction(descriptor.get);
    else
        throw new Error("Only put a Memoize decorator on a method or get accessor.");
}

const weakMap = new WeakMap<object, Map<string, unknown>>();

let counter = 0;
function getNewFunction(originalFunction: (...args: any[]) => void) {
    const identifier = counter++;
    function decorator(this: any, ...args: any[]) {
        let propertyValues = weakMap.get(this);
        if (propertyValues == null) {
            propertyValues = new Map<string, unknown>();
            weakMap.set(this, propertyValues);
        }
        let propName = `__memoized_value_${identifier}`;
        if (arguments.length > 0)
            propName += "_" + JSON.stringify(args);
        let returnedValue: any;

        if (propertyValues.has(propName))
            returnedValue = propertyValues.get(propName);
        else {
            returnedValue = originalFunction.apply(this, args);
            propertyValues.set(propName, returnedValue);
        }

        return returnedValue;
    }

    return decorator;
}
