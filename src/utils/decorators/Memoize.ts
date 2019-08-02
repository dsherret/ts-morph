export function Memoize(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
    if (descriptor.value != null)
        descriptor.value = getNewFunction(descriptor.value);
    else if (descriptor.get != null)
        descriptor.get = getNewFunction(descriptor.get);
    else
        throw new Error("Only put a Memoize decorator on a method or get accessor.");
}

let counter = 0;
function getNewFunction(originalFunction: (...args: any[]) => void) {
    const identifier = ++counter;

    function decorator(this: any, ...args: any[]) {
        let propName = `__memoized_value_${identifier}`;
        if (arguments.length > 0)
            propName += "_" + JSON.stringify(args);
        let returnedValue: any;

        if (this.hasOwnProperty(propName))
            returnedValue = this[propName];
        else {
            returnedValue = originalFunction.apply(this, args);
            Object.defineProperty(this, propName, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: returnedValue
            });
        }

        return returnedValue;
    }

    return decorator;
}
