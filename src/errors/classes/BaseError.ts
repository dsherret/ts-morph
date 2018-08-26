export abstract class BaseError extends Error {
    /** @internal */
    constructor(public readonly message: string, prototype: any) {
        super(message);

        this.message = message;

        // workaround for extending error to work in ES5 :(
        Object.setPrototypeOf(this, prototype);
    }
}
